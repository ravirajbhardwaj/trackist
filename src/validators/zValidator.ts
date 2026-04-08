import { zValidator as zv } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'
import { handleZodError } from './handleZodError'

export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, result => {
    if (!result.success) {
      handleZodError(result as any)
    }
  })
