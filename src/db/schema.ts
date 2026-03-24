import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('Role', ['USER', 'ADMIN'])
export const loginTypeEnum = pgEnum('LoginType', ['GOOGLE', 'EMAIL'])

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullname: varchar('fullname', { length: 20 }).notNull(),
  username: varchar('username', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  role: roleEnum('role').default('USER').notNull(),
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

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
