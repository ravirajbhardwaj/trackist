import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { logger } from '../logger/pino.logger'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL as string

if (!connectionString) {
  logger.error('DATABASE_URL is not defined')
  process.exit(1)
}

const neonSQL = neon(connectionString)
export const db = drizzle(neonSQL, { schema })
db.execute(sql`SELECT 1`)

logger.info('Drizzle connected to the database')
