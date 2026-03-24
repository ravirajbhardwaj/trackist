import fs from 'fs'
import type { Context, MiddlewareHandler, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { importSPKI, jwtVerify } from 'jose'
import path from 'path'
import { ApiError } from '../utils/http'

const __dirname = path.resolve()
const PublicKeyPath = path.join(__dirname, 'secrets/public.pem')

let cachedPublicKey: CryptoKey | null = null

async function getPublicKey() {
  if (cachedPublicKey) return cachedPublicKey

  if (!fs.existsSync(PublicKeyPath)) {
    throw new ApiError(500, `Public key file not found at ${PublicKeyPath}`)
  }

  const spki = fs.readFileSync(PublicKeyPath, { encoding: 'utf-8' }).trim()

  if (!/^-----BEGIN PUBLIC KEY-----/.test(spki)) {
    throw new ApiError(
      500,
      `Public key at ${PublicKeyPath} is not SPKI PEM. Ensure it starts with "-----BEGIN PUBLIC KEY-----".`
    )
  }

  cachedPublicKey = await importSPKI(spki, 'RS256')
  return cachedPublicKey
}

export type AuthUser = {
  _id: string
  username: string
  email: string
  role: string
  iss: string
  iat: number
  exp: number
}

export type AuthEnv = {
  Variables: {
    user: AuthUser
  }
}

export const verifyAccessToken: MiddlewareHandler<AuthEnv> = async (
  c: Context<AuthEnv>,
  next: Next
) => {
  const incomingAccessToken =
    getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '')

  if (!incomingAccessToken) {
    throw new ApiError(401, 'Unauthorized request')
  }

  try {
    const pubKey = await getPublicKey()

    const { payload } = await jwtVerify(incomingAccessToken, pubKey, {
      algorithms: ['RS256'],
      issuer: process.env.DOMAIN,
      maxTokenAge: '15m',
      requiredClaims: ['_id', 'iss', 'iat', 'exp'],
    })

    c.set('user', payload as AuthUser)
    await next()
  } catch (error: any) {
    console.error('Access token verification failed:', error?.message ?? error)
    throw new ApiError(401, 'Invalid or expired access token')
  }
}

export const verifyRefreshToken: MiddlewareHandler<AuthEnv> = async (
  c: Context<AuthEnv>,
  next: Next
) => {
  const body = await c.req.json().catch(() => ({}))
  const incomingRefreshToken = getCookie(c, 'refreshToken') || body?.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request')
  }

  try {
    const pubKey = await getPublicKey()

    const { payload } = await jwtVerify(incomingRefreshToken, pubKey, {
      algorithms: ['RS256'],
      issuer: process.env.DOMAIN,
      maxTokenAge: '24h',
      requiredClaims: ['_id', 'iss', 'iat', 'exp'],
      clockTolerance: '5s',
    })

    c.set('user', payload as unknown as AuthUser)
    await next()
  } catch (error: any) {
    console.error('Refresh token verification failed:', error?.message ?? error)
    throw new ApiError(403, 'Invalid or expired refresh token')
  }
}

export const verifyPermission = (roles: string[] = []): MiddlewareHandler<AuthEnv> => {
  return async (c: Context<AuthEnv>, next: Next) => {
    const user = c.get('user')

    if (!user?._id) {
      throw new ApiError(401, 'Unauthorized request')
    }

    if (roles.length === 0 || roles.includes(user.role)) {
      await next()
    } else {
      throw new ApiError(403, 'You are not allowed to perform this action')
    }
  }
}
