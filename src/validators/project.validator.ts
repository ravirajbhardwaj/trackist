import { z } from 'zod'

export const projectCreateSchema = z.object({
  name: z.string().nonempty({ message: 'Project name is required' }),
  description: z.string().optional(),
})

export const projectUpdateSchema = projectCreateSchema.partial()

export const teamMemberSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid User ID' }),
  role: z.enum(['LEADER', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'INTERN', 'CONTRIBUTOR']),
})

export const teamMemberUpdateSchema = z.object({
  role: z.enum(['LEADER', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'INTERN', 'CONTRIBUTOR']),
})

export type ProjectCreateData = z.infer<typeof projectCreateSchema>
export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>
export type TeamMemberData = z.infer<typeof teamMemberSchema>
export type TeamMemberUpdateData = z.infer<typeof teamMemberUpdateSchema>

export const validateProjectCreate = (data: unknown) => projectCreateSchema.safeParse(data)
export const validateProjectUpdate = (data: unknown) => projectUpdateSchema.safeParse(data)
export const validateTeamMember = (data: unknown) => teamMemberSchema.safeParse(data)
export const validateTeamMemberUpdate = (data: unknown) => teamMemberUpdateSchema.safeParse(data)
