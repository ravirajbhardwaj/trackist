import { Resend } from 'resend'
import { logger } from '@/logger/pino.logger'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Options {
  email: string
  subject: string
  html: string
}
/**
 * Sends an email using Resend API
 * @param {{email: string; subject: string; html: string; }} options
 */
const sendMail = async (options: Options) => {
  try {
    await resend.emails.send({
      from: 'AuthAPI <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    })
  } catch (error) {
    logger.error(`Email failed: ${error}`)
  }
}

const emailVerificationTemplate = (username: string, verificationUrl: string) => {
  return `
    <div style="font-family:sans-serif">
      <h2>Hello ${username},</h2>
      <p>Thanks for signing up 🎉</p>
      <p>Please verify your email:</p>
      <a href="${verificationUrl}" 
         style="background:#FFA500;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
         Verify Email
      </a>
      <p>If you didn’t sign up, ignore this.</p>
    </div>
  `
}

const forgotPasswordTemplate = (username: string, resetUrl: string) => {
  return `
    <div style="font-family:sans-serif">
      <h2>Hello ${username},</h2>
      <p>You requested a password reset.</p>
      <a href="${resetUrl}" 
         style="background:#FFA500;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
         Reset Password
      </a>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `
}

export { emailVerificationTemplate, forgotPasswordTemplate, sendMail }
