import { pgTable, text } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../utils'

export * from './auth'

export const tenantSchemas = pgTable('tenant_schemas', {
  ...id,
  schemaName: text('schema_name').notNull(),
  ...timestamps,
})
