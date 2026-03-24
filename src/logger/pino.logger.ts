import pino, { type Logger, stdTimeFunctions } from 'pino'
import { ApiError } from '@/utils/http'

const IS_DEV = process.env.NODE_ENV === 'development'
const LOG_LEVEL = IS_DEV ? 'debug' : 'info'

const redact = {
  paths: [
    'password',
    'token',
    'apiKey',
    'authorization',
    '*.password',
    '*.token',
    'req.headers.authorization',
    'req.headers.cookie',
    'creditCard.number',
    'ssn',
  ],
  remove: true,
}

const base = {
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION || undefined,
}

function createLogger(): Logger {
  const commonOptions = {
    level: LOG_LEVEL,
    redact,
    base,
    timestamp: stdTimeFunctions.isoTime,
  }

  if (IS_DEV) {
    return pino(
      commonOptions,
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      })
    )
  }

  try {
    return pino(commonOptions)
  } catch {
    throw new ApiError(500, 'LOGGER FAILED')
  }
}

export const logger = createLogger()
