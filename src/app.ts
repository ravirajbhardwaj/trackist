import { DrizzleError } from 'drizzle-orm'
import { Hono } from 'hono'
import { every } from 'hono/combine'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { logger } from './logger/pino.logger'
import NoteRouter from './routes/note'
import ProjectRouter from './routes/project'
import TaskRouter from './routes/task'
import UserRouter from './routes/user'
import wellKnownRouter from './routes/well-know'
import { ApiError } from './utils/http'

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
  .route('/projects', ProjectRouter)
  .route('/tasks', TaskRouter)
  .route('/notes', NoteRouter)
  .route('/well-known', wellKnownRouter)
  .notFound(c => {
    return c.json({ message: 'Not found' }, 404)
  })
  .onError((err, c) => {
    let apiError: ApiError
    if (err instanceof DrizzleError) {
      logger.error(err)
      apiError = new ApiError(400, 'DATABASE ERROR')
    } else if (err instanceof ApiError) {
      logger.error(err)
      apiError = err
    } else {
      logger.error(err)
      apiError = new ApiError(500, err.message || 'INTERNAL SERVER ERROR')
    }

    return c.json(
      {
        code: apiError.statusCode,
        message: apiError.message,
        data: apiError.data,
        success: apiError.success,
      },
      apiError.statusCode as ContentfulStatusCode
    )
  })

export type AppType = typeof app
export default app
