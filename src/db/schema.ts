import { relations } from 'drizzle-orm'
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('Role', ['ADMIN', 'MEMBER', 'VIEWER'])
export const loginTypeEnum = pgEnum('LoginType', ['GOOGLE', 'EMAIL'])
export const teamMemberRoleEnum = pgEnum('TeamMemberRole', [
  'LEADER',
  'MANAGER',
  'DEVELOPER',
  'DESIGNER',
  'TESTER',
  'INTERN',
  'CONTRIBUTOR',
])
export const taskStatusEnum = pgEnum('TaskStatus', ['TODO', 'IN_PROGRESS', 'DONE'])
export const taskPriorityEnum = pgEnum('TaskPriority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullname: varchar('fullname', { length: 20 }).notNull(),
  username: varchar('username', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  role: roleEnum('role').default('ADMIN').notNull(),
  loginType: loginTypeEnum('loginType').default('EMAIL').notNull(),
  refreshToken: text('refreshToken').unique(),
  forgotPasswordToken: text('forgotPasswordToken'),
  forgotPasswordExpiry: timestamp('forgotPasswordExpiry', { mode: 'date' }),
  isEmailVerified: boolean('isEmailVerified').default(false).notNull(),
  emailVerificationToken: text('emailVerificationToken'),
  emailVerificationExpiry: timestamp('emailVerificationExpiry', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdBy: uuid('createdBy').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const teamMembersTable = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('projectId')
    .references(() => projectsTable.id, { onDelete: 'cascade' })
    .notNull(),
  role: teamMemberRoleEnum('role').default('LEADER').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const tasksTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('projectId').references(() => projectsTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: taskPriorityEnum('priority').default('MEDIUM').notNull(),
  status: taskStatusEnum('status').default('TODO').notNull(),
  assignedBy: uuid('assignedBy').references(() => usersTable.id, { onDelete: 'set null' }),
  assignedTo: uuid('assignedTo').references(() => usersTable.id, { onDelete: 'set null' }),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const subtasksTable = pgTable('subtasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('taskId').references(() => tasksTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  isCompleted: boolean('isCompleted').default(false).notNull(),
  createdBy: uuid('createdBy').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const notesTable = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('projectId').references(() => projectsTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdBy: uuid('createdBy').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  projects: many(projectsTable),
  teamMemberships: many(teamMembersTable),
  assignedTasks: many(tasksTable, { relationName: 'assignedTo' }),
  createdTasks: many(tasksTable, { relationName: 'assignedBy' }),
  subtasks: many(subtasksTable),
  notes: many(notesTable),
}))

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [projectsTable.createdBy],
    references: [usersTable.id],
  }),
  teamMembers: many(teamMembersTable),
  tasks: many(tasksTable),
  notes: many(notesTable),
}))

export const teamMembersRelations = relations(teamMembersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [teamMembersTable.userId],
    references: [usersTable.id],
  }),
  project: one(projectsTable, {
    fields: [teamMembersTable.projectId],
    references: [projectsTable.id],
  }),
}))

export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  assignedBy: one(usersTable, {
    fields: [tasksTable.assignedBy],
    references: [usersTable.id],
    relationName: 'assignedBy',
  }),
  assignedTo: one(usersTable, {
    fields: [tasksTable.assignedTo],
    references: [usersTable.id],
    relationName: 'assignedTo',
  }),
  subtasks: many(subtasksTable),
}))

export const subtasksRelations = relations(subtasksTable, ({ one }) => ({
  task: one(tasksTable, {
    fields: [subtasksTable.taskId],
    references: [tasksTable.id],
  }),
  creator: one(usersTable, {
    fields: [subtasksTable.createdBy],
    references: [usersTable.id],
  }),
}))

export const notesRelations = relations(notesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [notesTable.projectId],
    references: [projectsTable.id],
  }),
  creator: one(usersTable, {
    fields: [notesTable.createdBy],
    references: [usersTable.id],
  }),
}))

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
export type Project = typeof projectsTable.$inferSelect
export type TeamMember = typeof teamMembersTable.$inferSelect
export type Task = typeof tasksTable.$inferSelect
export type Subtask = typeof subtasksTable.$inferSelect
export type Note = typeof notesTable.$inferSelect
