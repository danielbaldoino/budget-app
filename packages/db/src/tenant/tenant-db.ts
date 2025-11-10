import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../lib/env'

import { createTenantSchema } from './schema'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const tenantDb = (tenantSchema: string) => {
  return drizzle(pool, {
    logger: env.APP_ENV === 'development',
    schema: createTenantSchema(tenantSchema),
  })
}

export type TenantDatabase = ReturnType<typeof tenantDb>

export type TenantSchemaCallback<T> = (
  schema: ReturnType<typeof createTenantSchema>,
) => T | Promise<T>

export function tenantSchema<T>(
  tenantSchema: string,
  cb: TenantSchemaCallback<T>,
) {
  const schema = createTenantSchema(tenantSchema)

  return cb(schema)
}
