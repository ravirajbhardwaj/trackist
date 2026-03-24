import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { UserLoginType, UserRolesEnum, USER_COOKIE_TOKEN_EXPIRY } from '@/constants'
import { prisma } from '@/db/database'
import type { User } from '@/generated/prisma/client'
import { logger } from '@/logger/pino.logger'
import { verifyAccessToken, verifyPermission, verifyRefreshToken, type AuthEnv } from '@/middlewares/auth.middlewares'
import {
  createHash,
  generateAccessAndRefreshTokens,
  generateTemporaryToken,
  hashPassword,
  passwordMatch,
} from '@/utils/helper'
import { ApiError, ApiResponse } from '@/utils/http'
import {
  emailVerificationTemplate,
  forgotPasswordTemplate,
  sendMail,
} from '@/utils/mail.js'
import {
  type RegisterData,
  validateRegister,
  validateLogin,
  validateEmail,
  validateChangePassword,
  validateResetPassword,
} from '@/validators/auth.validator'
import { handleZodError } from '@/validators/handleZodError'

export const sanitizeUser = (user: User) => {
  const {
    password,
    emailVerificationToken,
    emailVerificationExpiry,
    forgotPasswordToken,
    forgotPasswordExpiry,
    createdAt,
    updatedAt,
    ...safeUser
  } = user
  return safeUser
}

const userRouter = new Hono<AuthEnv>({ strict: false })

// ─── Unsecure Routes ─────────────────────────────────────────

userRouter.post('/register', async (c) => {
  const body: RegisterData = await c.req.json()

  const { fullname, username, email, password, role } = handleZodError(validateRegister(body))
  logger.info({ email, username }, `Registration attempt`)

  const existedUser = await prisma.user.findUnique({ where: { email } })

  if (existedUser) {
    throw new ApiError(409, 'User with username or email already exists')
  }

  const hashedPassword = await hashPassword(password)
  const { unHashedToken, hashedToken, tokenExpiry } = await generateTemporaryToken()

  const user = await prisma.user.create({
    data: {
      avatar: 'https://i.pravatar.cc/300',
      fullname,
      username,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: tokenExpiry,
      isEmailVerified: false,
      role: role ?? UserRolesEnum.USER,
    },
  })

  const url = new URL(c.req.url)

  await sendMail({
    email: user.email,
    subject: 'Please verify your email',
    html: emailVerificationTemplate(
      user?.username,
      `${url.protocol}//${url.hostname}/api/v1/users/verify-email/${unHashedToken}`
    ),
  })

  logger.info({ email, id: user.id }, `Verification email sent`)

  const safeUser = sanitizeUser(user)

  logger.info({ email, id: user.id }, `User registered successfully`)

  return c.json(
    new ApiResponse(
      201,
      { user: safeUser },
      'Users registered successfully and verification email has been sent on your email'
    ),
    201
  )
})

userRouter.post('/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = handleZodError(validateLogin(body))
  logger.info({ email }, `Login attempt`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      role: true,
      loginType: true,
      isEmailVerified: true,
      avatar: true,
      fullname: true,
    },
  })

  if (!user) {
    logger.warn({ email }, `Login failed - User not foun  d`)
    throw new ApiError(404, 'User does not exist')
  }

  if (!user.isEmailVerified) {
    logger.warn({ email }, `Login failed - Email not verified`)
    throw new ApiError(403, 'Please verify your email before logging in')
  }

  if (user.loginType !== UserLoginType.EMAIL) {
    logger.warn({ email, type: user.loginType }, `Login failed - Wrong login type`)
    throw new ApiError(
      400,
      `You have previously registered using ${user.loginType?.toLowerCase()}.
      Please use the ${user.loginType?.toLowerCase()} login option to access your account.`
    )
  }

  const isPasswordMatch = await passwordMatch(password, user.password as string)

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid user credentials')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens({
    _id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  })

  const safeUser = sanitizeUser(user as User)

  logger.info(`User logged in successfully`)

  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(c, 'accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: USER_COOKIE_TOKEN_EXPIRY,
  })
  setCookie(c, 'refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: USER_COOKIE_TOKEN_EXPIRY,
  })

  return c.json(
    new ApiResponse(200, { user: safeUser, accessToken, refreshToken }, 'Logged in successfully'),
    200
  )
})

userRouter.get('/verify-email/:verificationToken', async (c) => {
  const verificationToken = c.req.param('verificationToken')
  logger.info(`Email verification attempt`)

  if (!verificationToken) {
    logger.warn(`Email verification failed - Missing token`)
    throw new ApiError(400, 'Email verification token is missing')
  }

  const hashedToken = await createHash(verificationToken)

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
      isEmailVerified: true,
    },
  })

  if (!user) {
    logger.warn(`Email verification failed - Invalid or expired token`)
    throw new ApiError(400, 'Invalid or expired verification token')
  }

  if (user.isEmailVerified) {
    logger.info(`Email already verified - Email: ${user.email}, UserID: ${user.id}`)
    return c.json(
      new ApiResponse(200, { isEmailVerified: true }, 'Email is already verified'),
      200
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      isEmailVerified: true,
    },
  })

  logger.info(`Email verified successfully - Email: ${user.email}, UserID: ${user.id}`)

  return c.json(
    new ApiResponse(
      200,
      { isEmailVerified: true },
      'Email verified successfully! You can now log in to your account.'
    ),
    200
  )
})

// ─── Secure Routes ───────────────────────────────────────────

userRouter.post('/refresh-token', verifyRefreshToken, async (c) => {
  const userId = c.get('user')._id
  logger.info({ userId }, `Refresh access token attempt`)

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  })

  if (!dbUser) {
    logger.warn({ userId }, `Refresh token failed - User not found`)
    throw new ApiError(404, 'User does not exist')
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens({
    _id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
  })

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { refreshToken: newRefreshToken },
  })

  logger.info({ userId: dbUser.id }, `Access & refresh tokens refreshed`)

  const isProduction = process.env.NODE_ENV === 'production'

  setCookie(c, 'accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: USER_COOKIE_TOKEN_EXPIRY,
  })
  setCookie(c, 'refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: USER_COOKIE_TOKEN_EXPIRY,
  })

  return c.json(
    new ApiResponse(200, { accessToken, newRefreshToken }, 'Access token refreshed'),
    200
  )
})

userRouter.use(verifyAccessToken)

userRouter.post('/logout', async (c) => {
  const userId = c.get('user')._id

  await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: undefined,
    },
  })

  deleteCookie(c, 'accessToken')
  deleteCookie(c, 'refreshToken')

  return c.json(new ApiResponse(200, {}, 'User logged out'), 200)
})

userRouter.post('/resend-email-verification', async (c) => {
  const userId = c.get('user')._id
  logger.info(`Resend email verification attempt - UserID: ${userId}`)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      isEmailVerified: true,
    },
  })

  if (!user) {
    logger.warn({ userId }, `Resend verification failed - User not found`)
    throw new ApiError(404, 'User does not exist')
  }

  if ((user as User).isEmailVerified) {
    logger.info(
      { email: user.email, userId: user.id },
      `Resend verification aborted - Email already verified`
    )
    throw new ApiError(400, 'User email is already verified')
  }

  const { unHashedToken, hashedToken, tokenExpiry } = await generateTemporaryToken()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: tokenExpiry,
    },
  })

  const url = new URL(c.req.url)

  await sendMail({
    email: user.email,
    subject: 'Please verify your email',
    html: emailVerificationTemplate(
      user?.username,
      `${url.protocol}//${url.hostname}/api/v1/users/verify-email/${unHashedToken}`
    ),
  })

  logger.info({ email: user.email, userId: user.id }, `Verification email resent`)

  return c.json(new ApiResponse(200, {}, 'Mail has been sent to your mail ID'), 200)
})

userRouter.get('/current-user', async (c) => {
  const userId = c.get('user')._id
  logger.info({ userId }, `Get current user request`)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      avatar: true,
      role: true,
      loginType: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    logger.warn({ userId }, `Get current user failed - User not found`)
    throw new ApiError(404, 'User does not exist')
  }

  logger.info({ userId }, `Current user fetched successfully`)

  return c.json(new ApiResponse(200, { user }, 'Current user fetched successfully'), 200)
})

userRouter.patch('/avatar', async (c) => {
  const userId = c.get('user')._id
  logger.info({ userId }, `Update avatar attempt`)

  // Hono uses c.req.parseBody() for multipart form data
  const body = await c.req.parseBody()
  const avatar = body['avatar']

  if (!avatar || !(avatar instanceof File)) {
    logger.warn({ userId }, `Update avatar failed - Missing file`)
    throw new ApiError(400, 'Avatar image is required')
  }

  // TODO: Replace with your file upload logic (e.g. Cloudinary)
  // const cloudinaryAvatar = await uploadOnCloudinary(avatarLocalPath)
  // const avatarUrl = cloudinaryAvatar?.secure_url ?? cloudinaryAvatar?.url
  const avatarUrl = '' // placeholder — plug in your upload logic

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      email: true,
      username: true,
      fullname: true,
      avatar: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  logger.info({ userId, avatarUrl }, `Avatar updated successfully`)

  return c.json(new ApiResponse(200, { user: updatedUser }, 'Avatar updated successfully'), 201)
})

userRouter.post('/forgot-password', async (c) => {
  const body = await c.req.json()
  const { email } = handleZodError(validateEmail(body))
  logger.info({ email }, `Forgot password request received`)

  if (!email) {
    logger.warn({ email }, `Forgot password failed - Missing email`)
    throw new ApiError(400, 'Email is required')
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    logger.warn({ email }, `Forgot password failed - User not found`)
    throw new ApiError(422, 'User does not exist')
  }

  const { unHashedToken, hashedToken, tokenExpiry } = await generateTemporaryToken()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: tokenExpiry,
    },
  })

  sendMail({
    email: user.email,
    subject: 'Forgot Password request',
    html: forgotPasswordTemplate(
      user?.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  })

  logger.info({ email: user.email, userId: user.id }, `Forgot password email sent`)

  return c.json(new ApiResponse(200, {}, 'Mail has been sent to your mail ID'), 200)
})

userRouter.post('/reset-password/:resetToken', async (c) => {
  const resetToken = c.req.param('resetToken')
  const body = await c.req.json()
  const { password } = handleZodError(validateResetPassword(body))

  logger.info(`Reset forgotten password attempt`)

  if (!resetToken && !password) {
    logger.warn(`Reset password failed - Missing token or password`)
    throw new ApiError(400, 'Invalid reset token and new Password')
  }

  const hashedToken = await createHash(resetToken as string)

  const user = await prisma.user.findFirst({
    where: {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
    },
  })

  if (!user) {
    logger.warn(`Reset password failed - Token invalid or expired`)
    throw new ApiError(489, 'Token is invalid or expired')
  }

  const hashedPassword = await hashPassword(password)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordExpiry: null,
    },
  })

  logger.info({ userId: user.id }, `Password reset successfully`)

  return c.json(new ApiResponse(201, {}, 'Password reset successfully'), 200)
})

userRouter.post('/change-password', async (c) => {
  const body = await c.req.json()
  const { currentPassword, newPassword } = handleZodError(validateChangePassword(body))
  const userId = c.get('user')._id

  logger.info({ userId }, `Change password attempt`)

  if (!currentPassword || !newPassword) {
    logger.warn({ userId }, `Change password failed - Missing fields`)
    throw new ApiError(400, 'Current Password and New Password is required')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  })

  if (!user) {
    logger.warn({ userId }, `Change password failed - User not found`)
    throw new ApiError(404, 'User does not exist')
  }

  const isPasswordMatch = await passwordMatch(currentPassword, user.password)

  if (!isPasswordMatch) {
    logger.warn({ userId }, `Change password failed - Invalid current password`)
    throw new ApiError(400, 'Invalid current password')
  }

  const hashedNewPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  })

  logger.info({ userId: user.id }, `Password changed successfully`)

  return c.json(new ApiResponse(201, {}, 'Password changed successfully'), 200)
})

userRouter.post('/assign-role/:userId', verifyPermission([UserRolesEnum.ADMIN]), async (c) => {
  const userId = c.req.param('userId')
  const { role } = await c.req.json()
  const performedBy = c.get('user')?._id

  logger.info(
    { targetUserId: userId, newRole: role, performedBy },
    `Assign role attempt`
  )

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    logger.warn({ targetUserId: userId }, `Assign role failed - User not found`)
    throw new ApiError(404, 'User does not exist')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  logger.info(
    { targetUserId: userId, newRole: role, performedBy },
    `Role updated for user`
  )

  return c.json(new ApiResponse(200, {}, 'Role changed for the user'), 200)
})

userRouter.post('/handle-social-login', async (c) => {
  // TODO: implement social login
  return c.json(new ApiResponse(200, {}, 'Social login'), 200)
})

export default userRouter
