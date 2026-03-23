import { Hono } from 'hono'
import { every } from 'hono/combine'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from './logger/pino.logger'
// import all routes
import UserRouter from './routes/user'
import wellKnownRouter from './routes/well-know'

const allowsOrigins = ['http://localhost:5173'] // Allowed by CORS

const app = new Hono({
  strict: false,
})
  .basePath('/api/v1')
  .use(
    every(
      secureHeaders(),
      cors({
        origin: allowsOrigins,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: 86400,
      })
    )
  )
  .use('*', async (c, next) => {
    const start = performance.now()

    await next()

    const duration = performance.now() - start

    logger.info({
      req: {
        method: c.req.method,
        path: c.req.path,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent'),
      },
      res: {
        status: c.res.status,
      },
      time: `${duration.toFixed(2)}ms`,
    })
  })
  .get('/', c => c.json({ message: 'Authentication API' }))
  .get('health', c => c.json({ status: 'RUNNIG' }))
  .route('/users', UserRouter)
  .route('/well-known', wellKnownRouter)
  .notFound(c => {
    return c.json({ message: 'Not found' }, 404)
  })
  .onError((_, c) => {
    return c.json({ message: 'Something went wrong' }, 500)
  })

export type AppType = typeof app
export default app
