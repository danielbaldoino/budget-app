import { defineConfig } from 'drizzle-kit'
import { TENANT_MIGRATIONS_SCHEMA, TENANT_MIGRATIONS_TABLE } from './constants'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/tenant/schema/index.ts',
  out: './src/tenant/migrations',
  migrations: {
    table: TENANT_MIGRATIONS_TABLE,
  },
  schemaFilter: [TENANT_MIGRATIONS_SCHEMA],
})
