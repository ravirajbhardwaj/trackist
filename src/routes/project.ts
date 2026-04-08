import { and, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { TeamMemberRolesEnums, UserRolesEnum } from '@/constants'
import { db } from '@/db'
import { projectsTable, teamMembersTable } from '@/db/schema'
import { logger } from '@/logger/pino.logger'
import { type AuthEnv, verifyAccessToken, verifyPermission } from '@/middlewares/auth.middlewares'
import { ApiError, ApiResponse } from '@/utils/http'
import {
  projectCreateSchema,
  projectUpdateSchema,
  teamMemberSchema,
  teamMemberUpdateSchema,
} from '@/validators/project.validator'
import { zValidator } from '@/validators/zValidator'

const projectRouter = new Hono<AuthEnv>({ strict: false })

projectRouter.use(verifyAccessToken)

projectRouter.get(
  '/',
  verifyPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER, UserRolesEnum.VIEWER]),
  async c => {
    const page = parseInt(c.req.query('page') as string, 10) || 1
    const limit = parseInt(c.req.query('limit') as string, 10) || 10
    const skip = (page - 1) * limit

    const projects = await db.select().from(projectsTable).limit(limit).offset(skip)
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(projectsTable)
    const count = result?.count ?? 0

    if (!projects || projects.length === 0) {
      throw new ApiError(404, 'No projects found')
    }

    return c.json(
      new ApiResponse(
        200,
        {
          totalProjects: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
          currentPage: page,
          projects,
        },
        'Projects fetched successfully'
      ),
      200
    )
  }
)

projectRouter.post(
  '/',
  zValidator('json', projectCreateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const data = c.req.valid('json')
    const userId = c.get('user')?._id
    logger.info({ userId, projectName: data.name }, 'Create project attempt')

    const [existedProject] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.name, data.name))

    if (existedProject) {
      logger.warn({ userId, projectName: data.name }, 'Project already exists')
      throw new ApiError(429, 'A project with this name already exists')
    }

    const [project] = await db
      .insert(projectsTable)
      .values({
        name: data.name,
        description: data.description || null,
        createdBy: userId || null,
      })
      .returning()

    if (!project) throw new ApiError(500, 'Failed to create project')

    logger.info({ userId, projectId: project.id }, 'Project created successfully')
    return c.json(new ApiResponse(201, project, 'Project created successfully'), 201)
  }
)

projectRouter.get('/:projectId', async c => {
  const projectId = c.req.param('projectId')

  if (!projectId) {
    throw new ApiError(400, 'Project id must be required')
  }

  const project = await db.query.projectsTable.findFirst({
    where: eq(projectsTable.id, projectId),
    with: {
      teamMembers: {
        with: {
          user: {
            columns: {
              id: true,
              fullname: true,
              username: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      },
      tasks: true,
      notes: true,
    },
  })

  if (!project) {
    throw new ApiError(404, 'Project does not exist')
  }

  return c.json(new ApiResponse(200, project, 'Project details fetched successfully'), 200)
})

projectRouter.put(
  '/:projectId',
  zValidator('json', projectUpdateSchema),
  verifyPermission([UserRolesEnum.ADMIN]),
  async c => {
    const projectId = c.req.param('projectId')
    const data = c.req.valid('json')
    const userId = c.get('user')?._id
    logger.info({ projectId, userId }, 'Update project attempt')

    if (!projectId) {
      throw new ApiError(400, 'Project id must be required')
    }

    if (!data.name) {
      throw new ApiError(400, 'Project name is required')
    }

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        name: data.name,
        description: data.description || null,
      })
      .where(eq(projectsTable.id, projectId))
      .returning()

    if (!updatedProject) {
      logger.warn({ projectId, userId }, 'Project update failed - Project not found')
      throw new ApiError(404, 'Project does not exist')
    }

    logger.info({ projectId, userId }, 'Project updated successfully')

    return c.json(new ApiResponse(200, updatedProject, 'Project updated successfully'), 200)
  }
)

projectRouter.delete('/:projectId', verifyPermission([UserRolesEnum.ADMIN]), async c => {
  const projectId = c.req.param('projectId')
  const userId = c.get('user')?._id
  logger.info({ projectId, userId }, 'Delete project attempt')

  if (!projectId) {
    throw new ApiError(400, 'Project id must be required')
  }

  const [deletedProject] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, projectId))
    .returning()

  if (!deletedProject) {
    logger.warn({ projectId, userId }, 'Project deletion failed - Not found')
    throw new ApiError(404, 'Project does not exist')
  }

  logger.info({ projectId, userId }, 'Project deleted successfully')

  return c.json(new ApiResponse(200, deletedProject, 'Project deleted successfully'), 200)
})

// TeamMember routes
projectRouter.get(
  '/:projectId/team',
  verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
  async c => {
    const projectId = c.req.param('projectId')
    const page = parseInt(c.req.query('page') as string, 10) || 1
    const limit = parseInt(c.req.query('limit') as string, 10) || 10
    const skip = (page - 1) * limit

    const teamMembers = await db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.projectId, projectId))
      .limit(limit)
      .offset(skip)
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembersTable)
      .where(eq(teamMembersTable.projectId, projectId))
    const count = result?.count ?? 0

    if (!teamMembers || teamMembers.length === 0) {
      throw new ApiError(404, 'No teamMembers found')
    }

    return c.json(
      new ApiResponse(
        200,
        {
          totalTeamMembers: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
          currentPage: page,
          teamMembers,
        },
        'TeamMembers fetch successfully'
      ),
      200
    )
  }
)

projectRouter.post(
  '/:projectId/team',
  zValidator('json', teamMemberSchema),
  verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
  async c => {
    const projectId = c.req.param('projectId')
    const data = c.req.valid('json')
    const performedBy = c.get('user')?._id
    logger.info({ projectId, targetUserId: data.userId, performedBy }, 'Add team member attempt')

    if (!projectId) {
      throw new ApiError(400, 'Project id must be required')
    }

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId))

    if (!project) {
      logger.warn(
        { projectId, targetUserId: data.userId, performedBy },
        'Add team member failed - Project not found'
      )
      throw new ApiError(404, 'Project does not exist')
    }

    const [userExistInTeam] = await db
      .select()
      .from(teamMembersTable)
      .where(
        and(eq(teamMembersTable.userId, data.userId), eq(teamMembersTable.projectId, projectId))
      )

    if (userExistInTeam) {
      logger.warn(
        { projectId, targetUserId: data.userId, performedBy },
        'Add team member failed - User already in team'
      )
      throw new ApiError(429, 'User already exist in Team')
    }

    const [memberToAdd] = await db
      .insert(teamMembersTable)
      .values({
        userId: data.userId,
        role: data.role,
        projectId: projectId,
      })
      .returning()

    logger.info(
      { projectId, targetUserId: data.userId, performedBy },
      'Team member added successfully'
    )
    return c.json(new ApiResponse(201, memberToAdd, 'Add member to project'), 201)
  }
)

projectRouter.put(
  '/:projectId/t/:memberId',
  zValidator('json', teamMemberUpdateSchema),
  verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
  async c => {
    const projectId = c.req.param('projectId')
    const memberId = c.req.param('memberId')
    const data = c.req.valid('json')
    const performedBy = c.get('user')?._id
    logger.info(
      { projectId, memberId, newRole: data.role, performedBy },
      'Update team member role attempt'
    )

    if (!projectId || !memberId) {
      throw new ApiError(400, 'Project id and Member id are required')
    }

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId))

    if (!project) {
      throw new ApiError(404, 'Project does not exist')
    }

    const [existInTeam] = await db
      .select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.id, memberId))

    if (!existInTeam) {
      throw new ApiError(404, 'Team member does not exist')
    }

    if (existInTeam.role === data.role) {
      throw new ApiError(400, 'This user already has the same role')
    }

    const [updatedMember] = await db
      .update(teamMembersTable)
      .set({ role: data.role })
      .where(eq(teamMembersTable.id, memberId))
      .returning()

    logger.info(
      { projectId, memberId, newRole: data.role, performedBy },
      'Team member role updated successfully'
    )
    return c.json(new ApiResponse(200, updatedMember, 'Team member role updated'), 200)
  }
)

projectRouter.delete(
  '/:projectId/t/:memberId',
  verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
  async c => {
    const projectId = c.req.param('projectId')
    const memberId = c.req.param('memberId')
    const performedBy = c.get('user')?._id
    logger.info({ projectId, memberId, performedBy }, 'Remove team member attempt')

    if (!projectId || !memberId) {
      throw new ApiError(400, 'Project id and Member id are required')
    }

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId))

    if (!project) {
      throw new ApiError(404, 'Project does not exist')
    }

    const [memberToDelete] = await db
      .delete(teamMembersTable)
      .where(eq(teamMembersTable.id, memberId))
      .returning()

    if (!memberToDelete) {
      throw new ApiError(404, 'Team member not found in this project')
    }

    logger.info({ projectId, memberId, performedBy }, 'Team member removed successfully')
    return c.json(new ApiResponse(200, memberToDelete, 'Team member removed successfully'), 200)
  }
)

export default projectRouter
