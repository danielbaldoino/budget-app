import { pgSchema, text } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../../utils'
import { TENANT_MIGRATIONS_SCHEMA } from '../constants'

export const tenantSchema = pgSchema(TENANT_MIGRATIONS_SCHEMA)

export const users = tenantSchema.table('users', {
  ...id,
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  ...timestamps,
})
