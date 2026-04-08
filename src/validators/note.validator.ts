import { z } from 'zod'

export const noteSchema = z.object({
  content: z.string().nonempty({ message: 'Content is required' }),
})

export type NoteData = z.infer<typeof noteSchema>

export const validateNote = (data: unknown) => noteSchema.safeParse(data)
