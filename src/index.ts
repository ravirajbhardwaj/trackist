import app from './app'
import { logger } from './logger/pino.logger'

const PORT = Number(process.env.PORT) || 8080

const server = Bun.serve({
  port: PORT,
  fetch: app.fetch,
})

logger.info(`API is running at: ${server.url}api/v1`)
