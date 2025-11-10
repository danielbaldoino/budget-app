import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import type { MigrationMeta } from 'drizzle-orm/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { PgSession } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'
import { env } from '../lib/env'
import { TENANT_MIGRATIONS_SCHEMA, TENANT_MIGRATIONS_TABLE } from './constants'
import { createTenantSchema } from './schema'

const DRIZZLE_STATEMENT_BREAKPOINT = '--> statement-breakpoint'

// Ref: https://github.com/drizzle-team/drizzle-orm/blob/8e8a9e902410ed2068a015d59180b225045dddf1/drizzle-orm/src/migrator.ts#L22
export function readMigrationFiles(tenantSchema: string): MigrationMeta[] {
  const migrationFolderTo = path.join(__dirname, 'migrations')

  const migrationQueries: MigrationMeta[] = []

  const journalPath = `${migrationFolderTo}/meta/_journal.json`
  if (!fs.existsSync(journalPath)) {
    throw new Error(`Can't find meta/_journal.json file`)
  }

  const journalAsString = fs
    .readFileSync(`${migrationFolderTo}/meta/_journal.json`)
    .toString()

  const journal = JSON.parse(journalAsString) as {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[]
  }

  for (const journalEntry of journal.entries) {
    const migrationPath = `${migrationFolderTo}/${journalEntry.tag}.sql`

    try {
      const query = fs
        .readFileSync(`${migrationFolderTo}/${journalEntry.tag}.sql`)
        .toString()

      const result = query.split(DRIZZLE_STATEMENT_BREAKPOINT).map((it) => {
        return it.replaceAll(TENANT_MIGRATIONS_SCHEMA, tenantSchema)
      })

      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: crypto.createHash('sha256').update(query).digest('hex'),
      })
    } catch {
      throw new Error(
        `No file ${migrationPath} found in ${migrationFolderTo} folder`,
      )
    }
  }

  return migrationQueries
}

// Ref: https://github.com/drizzle-team/drizzle-orm/blob/9865e63f43074f19c31ca1e73850f13224d0d00e/drizzle-orm/src/pg-core/dialect.ts#L73
export async function migrate(
  tenantSchema: string,
  migrations: MigrationMeta[],
  session: PgSession,
): Promise<void> {
  const migrationsTable = TENANT_MIGRATIONS_TABLE
  const migrationsSchema = tenantSchema

  const migrationTableCreate = sql`
        CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsSchema)}.${sql.identifier(migrationsTable)} (
            id SERIAL PRIMARY KEY,
            hash text NOT NULL,
            created_at bigint
        )
    `
  await session.execute(
    sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(migrationsSchema)}`,
  )
  await session.execute(migrationTableCreate)

  const dbMigrations = await session.all<{
    id: number
    hash: string
    created_at: string
  }>(
    sql`select id, hash, created_at from ${sql.identifier(migrationsSchema)}.${sql.identifier(
      migrationsTable,
    )} order by created_at desc limit 1`,
  )

  const lastDbMigration = dbMigrations[0]
  await session.transaction(async (tx) => {
    for await (const migration of migrations) {
      if (
        !lastDbMigration ||
        Number(lastDbMigration.created_at) < migration.folderMillis
      ) {
        for (const stmt of migration.sql) {
          await tx.execute(sql.raw(stmt))
        }
        await tx.execute(
          sql`insert into ${sql.identifier(migrationsSchema)}.${sql.identifier(
            migrationsTable,
          )} ("hash", "created_at") values(${migration.hash}, ${migration.folderMillis})`,
        )
      }
    }
  })
}

export async function migrateTenantSchema(tenantSchema: string) {
  const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 })

  try {
    const tenantDb = drizzle(pool, { schema: createTenantSchema() })

    const migrations = readMigrationFiles(tenantSchema)

    await migrate(
      tenantSchema,
      migrations,
      (tenantDb as unknown as { session: PgSession }).session,
    )

    console.log('Tenant migration complete: ', tenantSchema)
  } catch (error) {
    console.error('Tenant migration failed:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}
