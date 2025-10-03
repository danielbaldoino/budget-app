import { db } from '../db'
import * as mainSchema from '../schema'
import { migrateTenantSchema } from './migrator'

async function main() {
  const tenantSchemas = await db
    .select({
      schemaName: mainSchema.tenantSchemas.schemaName,
    })
    .from(mainSchema.tenantSchemas)

  for (const tenantSchema of tenantSchemas) {
    await migrateTenantSchema(tenantSchema.schemaName)
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
