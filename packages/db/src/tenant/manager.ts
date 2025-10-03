import type { AnyColumn, Query } from 'drizzle-orm'
import {
  Column,
  ColumnAliasProxyHandler,
  Table,
  entityKind,
  is,
} from 'drizzle-orm'
import { db } from '../db'
import { TENANT_MIGRATIONS_SCHEMA } from './constants'
import * as schema from './schema'

class TableSchemaProxyHandler<T extends Table> implements ProxyHandler<T> {
  static readonly [entityKind]: string = 'TableSchemaProxyHandler'

  private tenantSchema: string

  constructor(tenantSchema: string) {
    this.tenantSchema = tenantSchema
  }

  get(target: T, prop: string | symbol): unknown {
    const value = target[prop as keyof typeof target]

    // Ref: https://github.com/drizzle-team/drizzle-orm/blob/06be106f3d111339466eb596d000d7580c89b01f/drizzle-orm/src/table.ts#L66-L67
    // @ts-expect-error
    if (prop === Table.Symbol.Schema) {
      if (value === TENANT_MIGRATIONS_SCHEMA) {
        return this.tenantSchema
      }
      return
    }

    if (is(value, Column)) {
      return new Proxy(
        value as AnyColumn,
        new ColumnAliasProxyHandler(new Proxy(target, this)),
      )
    }

    return Reflect.get(target, prop)
  }
}

type TablesOnly<T> = {
  [K in keyof T]: T[K] extends Table ? T[K] : never
}[keyof T]

type TenantTable = TablesOnly<typeof schema>

type TenantTables = {
  [K in keyof typeof schema as (typeof schema)[K] extends TenantTable
    ? K
    : never]: (typeof schema)[K] extends TenantTable
    ? ReturnType<typeof tenantSchemaTable<(typeof schema)[K]>>
    : never
}

export function tenantSchemaTable<T extends TenantTable>(
  tenantSchema: string,
  table: T,
): T {
  return new Proxy(table, new TableSchemaProxyHandler(tenantSchema))
}

export function tenantSchemaTables<T>(
  tenantSchema: string,
  callback: (tables: TenantTables) => T | Promise<T>,
) {
  const tables = {} as any

  for (const [key, value] of Object.entries(schema)) {
    if (value instanceof Table) {
      tables[key] = tenantSchemaTable(tenantSchema, value as any)
    }
  }

  return callback(tables)
}

/**
 * Alias for tenantSchemaTable
 */
export const tSchema = tenantSchemaTable

/**
 * Alias for tenantSchemaTables
 */
export const tSchemaTables = tenantSchemaTables

export type SQL = { toSQL: () => Query }

/**
 * Experimental function to run a query on a tenant schema
 */
export async function experimental_tenantSchemaDb<T extends SQL>(
  tenantSchema: string,
  qb: T,
): Promise<T> {
  const query = qb.toSQL()

  const finalQuery = query.sql.replace(
    new RegExp(`"${TENANT_MIGRATIONS_SCHEMA}"\\.`, 'g'),
    `"${tenantSchema}".`,
  )

  const result = await db.$client.query(finalQuery, query.params)

  return result.rows as unknown as T
}
