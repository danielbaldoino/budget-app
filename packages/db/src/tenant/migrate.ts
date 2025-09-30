import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { db } from '../db'
import { env } from '../lib/env'
import * as mainSchema from '../schema'
import { migrate, readMigrationFiles } from './migrator'
import * as schema from './schema'

async function main() {
  const tenantSchemas = await db
    .select({
      schemaName: mainSchema.tenantSchemas.schemaName,
    })
    .from(mainSchema.tenantSchemas)

  for (const tenantSchema of tenantSchemas) {
    const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 })

    try {
      const tenantDb = drizzle(pool, { schema }) as any

      const migrations = readMigrationFiles(tenantSchema.schemaName)

      await migrate(tenantSchema.schemaName, migrations, tenantDb.session)

      console.log('Tenant migration complete: ', tenantSchema.schemaName)
    } catch (error) {
      console.error('Tenant migration failed:', error)
      process.exitCode = 1
    } finally {
      await pool.end()
    }
  }
}

main()
  .then(() => {
    console.log('Migration completed')
  })
  .catch((error) => {
    console.error('Migration failed', error)
    process.exit(1)
  })
