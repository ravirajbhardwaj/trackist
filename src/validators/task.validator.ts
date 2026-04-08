import { z } from 'zod'

export const taskCreateSchema = z.object({
  title: z.string().nonempty({ message: 'Title is required' }),
  description: z.string().optional(),
  projectId: z.string().uuid({ message: 'Invalid Project ID' }).optional(),
  assignedTo: z.string().uuid({ message: 'Invalid User ID' }).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO').optional(),
})

export const taskUpdateSchema = taskCreateSchema.partial()

export const subtaskCreateSchema = z.object({
  title: z.string().nonempty({ message: 'Title is required' }),
})

export const subtaskUpdateSchema = subtaskCreateSchema
  .extend({
    isCompleted: z.boolean().optional(),
    status: z.string().optional(), // kept for compatibility if needed based on req
  })
  .partial()

export type TaskCreateData = z.infer<typeof taskCreateSchema>
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>
export type SubtaskCreateData = z.infer<typeof subtaskCreateSchema>
export type SubtaskUpdateData = z.infer<typeof subtaskUpdateSchema>

export const validateTaskCreate = (data: unknown) => taskCreateSchema.safeParse(data)
export const validateTaskUpdate = (data: unknown) => taskUpdateSchema.safeParse(data)
export const validateSubtaskCreate = (data: unknown) => subtaskCreateSchema.safeParse(data)
export const validateSubtaskUpdate = (data: unknown) => subtaskUpdateSchema.safeParse(data)
