import { eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { TaskPriorityEnums, UserRolesEnum } from '@/constants'
import { db } from '@/db'
import { subtasksTable, tasksTable } from '@/db/schema'
import { logger } from '@/logger/pino.logger'
import { type AuthEnv, verifyAccessToken, verifyPermission } from '@/middlewares/auth.middlewares'
import { ApiError, ApiResponse } from '@/utils/http'
import {
  subtaskCreateSchema,
  subtaskUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
} from '@/validators/task.validator'
import { zValidator } from '@/validators/zValidator'

const taskRouter = new Hono<AuthEnv>({ strict: false })

taskRouter.use(verifyAccessToken)

taskRouter.get('/', async c => {
  const page = parseInt(c.req.query('page') as string, 10) || 1
  const limit = parseInt(c.req.query('limit') as string, 10) || 10
  const skip = (page - 1) * limit

  const tasks = await db.select().from(tasksTable).limit(limit).offset(skip)
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(tasksTable)
  const count = result?.count ?? 0

  if (!tasks || tasks.length === 0) {
    throw new ApiError(404, 'Task not found')
  }

  return c.json(
    new ApiResponse(
      200,
      {
        totalTasks: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
        currentPage: page,
        tasks,
      },
      'Tasks fetch successfully'
    ),
    200
  )
})

taskRouter.post(
  '/',
  zValidator('json', taskCreateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ userId, title: data.title }, 'Create task attempt')

    const [existedTask] = await db.select().from(tasksTable).where(eq(tasksTable.title, data.title))

    if (existedTask) {
      logger.warn({ userId, title: data.title }, 'Task creation failed - Title already exists')
      throw new ApiError(429, 'Task with title already exist')
    }

    const [task] = await db
      .insert(tasksTable)
      .values({
        projectId: data.projectId || null,
        title: data.title,
        description: data.description || null,
        assignedBy: userId || null,
        assignedTo: data.assignedTo || null,
        priority: data.priority ?? TaskPriorityEnums.MEDIUM,
        status: data.status ?? 'TODO',
      })
      .returning()

    if (!task) {
      logger.warn({ userId, title: data.title }, 'Task creation failed')
      throw new ApiError(500, 'Something went wrong while created the task')
    }

    logger.info({ userId, taskId: task.id }, 'Task created successfully')
    return c.json(new ApiResponse(200, task, 'Task created successfully'), 200)
  }
)

taskRouter.get('/:taskId', async c => {
  const taskId = c.req.param('taskId')
  const userId = c.get('user')?._id

  if (!taskId) {
    throw new ApiError(400, 'Task id is required')
  }

  const task = await db.query.tasksTable.findFirst({
    where: eq(tasksTable.id, taskId),
    with: {
      subtasks: true,
      assignedBy: {
        columns: {
          id: true,
          fullname: true,
          avatar: true,
          email: true,
        },
      },
      assignedTo: {
        columns: {
          id: true,
          fullname: true,
          avatar: true,
          email: true,
        },
      },
    },
  })

  if (!task) {
    logger.warn({ taskId, userId }, 'Task fetch failed - Not found')
    throw new ApiError(404, 'Task not found')
  }

  logger.info({ taskId, userId }, 'Task fetched successfully')
  return c.json(new ApiResponse(200, task, 'Task fetch successfully'), 200)
})

taskRouter.put(
  '/:taskId',
  zValidator('json', taskUpdateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const taskId = c.req.param('taskId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ taskId, userId }, 'Update task attempt')

    const [task] = await db
      .update(tasksTable)
      .set({
        title: data.title,
        description: data.description,
        status: data.status,
        assignedTo: data.assignedTo,
        priority: data.priority,
      })
      .where(eq(tasksTable.id, taskId))
      .returning()

    if (!task) {
      logger.warn({ taskId, userId }, 'Task update failed - Not found')
      throw new ApiError(404, 'Task not found')
    }

    logger.info({ taskId, userId }, 'Task updated successfully')
    return c.json(new ApiResponse(200, task, 'Task updated successfully'), 200)
  }
)

taskRouter.delete('/:taskId', verifyPermission([UserRolesEnum.ADMIN]), async c => {
  const taskId = c.req.param('taskId')
  const userId = c.get('user')?._id

  logger.info({ taskId, userId }, 'Delete task attempt')

  if (!taskId) {
    throw new ApiError(400, 'Task id is required')
  }

  const [deletedTask] = await db.delete(tasksTable).where(eq(tasksTable.id, taskId)).returning()

  if (!deletedTask) {
    logger.warn({ taskId, userId }, 'Task deletion failed - Not found')
    throw new ApiError(404, 'Something went wrong while deleting task')
  }

  logger.info({ taskId, userId }, 'Task deleted successfully')
  return c.json(new ApiResponse(200, deletedTask, 'Task deleted successfully'), 200)
})

// Subtask routes
taskRouter.get('/:taskId/subtasks', async c => {
  const taskId = c.req.param('taskId')
  const page = parseInt(c.req.query('page') as string, 10) || 1
  const limit = parseInt(c.req.query('limit') as string, 10) || 10
  const skip = (page - 1) * limit

  const subTasks = await db
    .select()
    .from(subtasksTable)
    .where(eq(subtasksTable.taskId, taskId))
    .limit(limit)
    .offset(skip)

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subtasksTable)
    .where(eq(subtasksTable.taskId, taskId))
  const count = result?.count ?? 0

  if (!subTasks || subTasks.length === 0) {
    throw new ApiError(404, 'SubTask not found')
  }

  return c.json(
    new ApiResponse(
      200,
      {
        totalSubTasks: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
        currentPage: page,
        subTasks,
      },
      'SubTasks fetch successfully'
    ),
    200
  )
})

taskRouter.post(
  '/:taskId/subtasks',
  zValidator('json', subtaskCreateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const taskId = c.req.param('taskId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ taskId, userId, subtaskTitle: data.title }, 'Create subtask attempt')

    if (!taskId || !data.title) {
      throw new ApiError(400, 'Task Id and title is required')
    }

    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId))

    if (!task) {
      logger.warn({ taskId, userId }, 'Subtask creation failed - Task not found')
      throw new ApiError(404, 'Task does not exists')
    }

    const [subTask] = await db
      .insert(subtasksTable)
      .values({
        taskId: task.id,
        title: data.title,
        createdBy: userId || null,
      })
      .returning()

    logger.info({ taskId, subtaskId: subTask?.id, userId }, 'Subtask created successfully')
    return c.json(new ApiResponse(201, subTask, 'Subtask created successfully'), 201)
  }
)

taskRouter.get('/:taskId/subtasks/:subtaskId', async c => {
  const taskId = c.req.param('taskId')
  const subtaskId = c.req.param('subtaskId')

  if (!taskId && !subtaskId) {
    throw new ApiError(400, 'Task and Subtask id is required')
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId))

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  const [subtask] = await db.select().from(subtasksTable).where(eq(subtasksTable.id, subtaskId))

  if (!subtask) {
    throw new ApiError(404, 'Subtask not found')
  }

  return c.json(new ApiResponse(200, subtask, 'SubTask fetch by Id'), 200)
})

taskRouter.put(
  '/:taskId/subtasks/:subtaskId',
  zValidator('json', subtaskUpdateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const taskId = c.req.param('taskId')
    const subtaskId = c.req.param('subtaskId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id

    logger.info({ taskId, subtaskId, userId }, 'Update subtask attempt')

    if (!taskId || !subtaskId) {
      throw new ApiError(400, 'Task ID and Subtask ID are required')
    }

    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId))
    if (!task) throw new ApiError(404, 'Task not found')

    const [subtask] = await db.select().from(subtasksTable).where(eq(subtasksTable.id, subtaskId))
    if (!subtask) throw new ApiError(404, 'Subtask not found')

    const [updatedSubtask] = await db
      .update(subtasksTable)
      .set({
        title: data.title !== undefined ? data.title : subtask.title,
        isCompleted: data.isCompleted !== undefined ? data.isCompleted : subtask.isCompleted,
      })
      .where(eq(subtasksTable.id, subtaskId))
      .returning()

    logger.info({ taskId, subtaskId, userId }, 'Subtask updated successfully')
    return c.json(new ApiResponse(200, updatedSubtask, 'Subtask updated successfully'), 200)
  }
)

taskRouter.delete(
  '/:taskId/subtasks/:subtaskId',
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const taskId = c.req.param('taskId')
    const subtaskId = c.req.param('subtaskId')
    const userId = c.get('user')?._id
    logger.info({ taskId, subtaskId, userId }, 'Delete subtask attempt')

    if (!taskId || !subtaskId) throw new ApiError(400, 'Task ID and Subtask ID are required')

    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId))
    if (!task) throw new ApiError(404, 'Task not found')

    const [deletedSubtask] = await db
      .delete(subtasksTable)
      .where(eq(subtasksTable.id, subtaskId))
      .returning()
    if (!deletedSubtask) throw new ApiError(404, 'Subtask not found')

    logger.info({ taskId, subtaskId, userId }, 'Subtask deleted successfully')
    return c.json(new ApiResponse(200, deletedSubtask, 'Subtask deleted successfully'), 200)
  }
)

taskRouter.put(
  '/:taskId/subtasks/:subtaskId/toggle',
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const taskId = c.req.param('taskId')
    const subtaskId = c.req.param('subtaskId')
    const userId = c.get('user')?._id
    logger.info({ taskId, subtaskId, userId }, 'Toggle subtask attempt')

    if (!taskId && !subtaskId) throw new ApiError(400, 'Task and SubTask Id is required')

    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId))
    if (!task) throw new ApiError(404, 'Task not found')

    const [subtask] = await db.select().from(subtasksTable).where(eq(subtasksTable.id, subtaskId))
    if (!subtask) throw new ApiError(404, 'Subtask not found')

    const [updatedSubtask] = await db
      .update(subtasksTable)
      .set({ isCompleted: !subtask.isCompleted })
      .where(eq(subtasksTable.id, subtaskId))
      .returning()

    logger.info({ taskId, subtaskId, userId }, 'Subtask toggled successfully')
    return c.json(new ApiResponse(200, updatedSubtask, 'Task status toggled'), 200)
  }
)

export default taskRouter
