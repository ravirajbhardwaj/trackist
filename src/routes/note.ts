import { and, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { UserRolesEnum } from '@/constants'
import { db } from '@/db'
import { notesTable, projectsTable } from '@/db/schema'
import { logger } from '@/logger/pino.logger'
import { type AuthEnv, verifyAccessToken, verifyPermission } from '@/middlewares/auth.middlewares'
import { ApiError, ApiResponse } from '@/utils/http'
import { noteSchema } from '@/validators/note.validator'
import { zValidator } from '@/validators/zValidator'

const noteRouter = new Hono<AuthEnv>({ strict: false })

noteRouter.use(verifyAccessToken)

noteRouter.get(
  '/:projectId',
  verifyPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.VIEWER]),
  async c => {
    const projectId = c.req.param('projectId')
    const page = parseInt(c.req.query('page') as string, 10) || 1
    const limit = parseInt(c.req.query('limit') as string, 10) || 10
    const skip = (page - 1) * limit

    const notes = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.projectId, projectId))
      .limit(limit)
      .offset(skip)
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notesTable)
      .where(eq(notesTable.projectId, projectId))
    const count = result?.count ?? 0

    if (!notes || notes.length === 0) {
      throw new ApiError(404, 'No Notes found')
    }

    return c.json(
      new ApiResponse(
        200,
        {
          totalNotes: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
          currentPage: page,
          notes,
        },
        'Notes fetched successfully'
      ),
      200
    )
  }
)

noteRouter.post(
  '/:projectId',
  zValidator('json', noteSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const projectId = c.req.param('projectId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ projectId, userId }, 'Create note attempt')

    if (!projectId || !data.content) {
      throw new ApiError(400, 'Project id and content is required')
    }

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId))

    if (!project) throw new ApiError(404, 'Project not found')

    const [note] = await db
      .insert(notesTable)
      .values({
        projectId: projectId,
        content: data.content,
        createdBy: userId || null,
      })
      .returning()

    logger.info({ projectId, noteId: note?.id, userId }, 'Note created successfully')
    return c.json(new ApiResponse(201, note, 'Note created successfully'), 201)
  }
)

noteRouter.get(
  '/:projectId/n/:noteId',
  verifyPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.VIEWER]),
  async c => {
    const projectId = c.req.param('projectId')
    const noteId = c.req.param('noteId')
    const userId = c.get('user')?._id

    if (!projectId && !noteId) throw new ApiError(400, 'Project & Note id is required')

    const note = await db.query.notesTable.findFirst({
      where: and(eq(notesTable.projectId, projectId), eq(notesTable.id, noteId)),
      with: {
        creator: {
          columns: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    })

    if (!note) {
      logger.warn({ projectId, noteId, userId }, 'Note fetch failed - Not found')
      throw new ApiError(404, 'Note not found')
    }

    logger.info({ projectId, noteId, userId }, 'Note fetched successfully')
    return c.json(new ApiResponse(201, note, 'Note fetch successfully'), 200)
  }
)

noteRouter.put(
  '/:projectId/n/:noteId',
  zValidator('json', noteSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const projectId = c.req.param('projectId')
    const noteId = c.req.param('noteId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ projectId, noteId, userId }, 'Update note attempt')

    if (!projectId && !noteId && !data.content) {
      throw new ApiError(400, 'Project & Note id and content is required')
    }

    const [existedNote] = await db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.projectId, projectId), eq(notesTable.id, noteId)))

    if (!existedNote) {
      logger.warn({ projectId, noteId, userId }, 'Note update failed - Not found')
      throw new ApiError(404, 'Note does not exist')
    }

    const [updatedNote] = await db
      .update(notesTable)
      .set({ content: data.content })
      .where(eq(notesTable.id, noteId))
      .returning()

    logger.info({ projectId, noteId, userId }, 'Note updated successfully')
    return c.json(new ApiResponse(201, updatedNote, 'Note updated successfully'), 200)
  }
)

noteRouter.delete('/:projectId/n/:noteId', verifyPermission([UserRolesEnum.ADMIN]), async c => {
  const projectId = c.req.param('projectId')
  const noteId = c.req.param('noteId')
  const userId = c.get('user')?._id

  logger.info({ projectId, noteId, userId }, 'Delete note attempt')

  if (!projectId && !noteId) throw new ApiError(400, 'Project & Note id is required')

  const [deletedNote] = await db.delete(notesTable).where(eq(notesTable.id, noteId)).returning()

  if (!deletedNote) {
    logger.warn({ projectId, noteId, userId }, 'Note deletion failed - Not found')
    throw new ApiError(404, 'Note not found')
  }

  logger.info({ projectId, noteId, userId }, 'Note deleted successfully')
  return c.json(new ApiResponse(200, deletedNote, 'Note deleted successfully'), 200)
})

export default noteRouter
