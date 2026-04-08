import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { importPKCS8, SignJWT } from 'jose'
import { logger } from '@/logger/pino.logger'
import { ApiError } from './http'

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10)

export const passwordMatch = async (enteredPassword: string, storedPassword: string) => {
  return await bcrypt.compare(enteredPassword, storedPassword)
}

export const createHash = async (token: string) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Buffer.from(buffer).toString('hex')
}

export const generateTemporaryToken = async () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))

  const unHashedToken = Buffer.from(bytes).toString('hex')
  const hashedToken = await createHash(unHashedToken)
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000)

  return { unHashedToken, hashedToken, tokenExpiry }
}

const __dirname = path.resolve()
const PrivateKeyPath = path.join(__dirname, 'secrets/private.pem')

let cachedPrivateKey: CryptoKey | null = null

async function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey

  if (!fs.existsSync(PrivateKeyPath)) {
    throw new ApiError(500, `Private key file not found at ${PrivateKeyPath}`)
  }

  const pkcs8 = fs.readFileSync(PrivateKeyPath, { encoding: 'utf-8' }).trim()

  cachedPrivateKey = await importPKCS8(pkcs8, 'RS256')
  return cachedPrivateKey
}

export const generateAccessAndRefreshTokens = async (payload: object) => {
  try {
    const privateKey = await getPrivateKey()
    const now = Math.floor(Date.now() / 1000)

    const basePayload = {
      ...payload,
      iss: process.env.DOMAIN,
      iat: now,
    }

    const accessToken = await new SignJWT(basePayload)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setIssuer(process.env.DOMAIN || '')
      .setExpirationTime('15m')
      .sign(privateKey)

    const refreshToken = await new SignJWT(basePayload)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(now)
      .setIssuer(process.env.DOMAIN || '')
      .setExpirationTime('24h')
      .sign(privateKey)

    return { accessToken, refreshToken }
  } catch (error) {
    logger.error(`Failed to generate access and refresh tokens: ${error}`)
    throw new ApiError(500, 'An error occurred while generating the access and refresh tokens.')
  }
}
