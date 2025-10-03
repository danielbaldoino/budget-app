import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../utils'

export * from './auth'

export const tenantSchemas = pgTable('tenant_schemas', {
  ...id,
  schemaName: text('schema_name').notNull(),
  ...timestamps,
})

export const workspaces = pgTable('workspaces', {
  ...id,
  active: boolean('active').notNull().default(true),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  logoUrl: text('logo_url'),
  ownerId: text('owner_id').notNull(),
  tenantSchemaId: text('tenant_schema_id').references(() => tenantSchemas.id),
  ...timestamps,
})
