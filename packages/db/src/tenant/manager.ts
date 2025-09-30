import type { AnyColumn } from 'drizzle-orm'
import {
  Column,
  ColumnAliasProxyHandler,
  Table,
  entityKind,
  is,
} from 'drizzle-orm'
import { TENANT_MIGRATIONS_SCHEMA } from './constants'
import type * as tenantSchema from './schema'

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
type TenantTable = TablesOnly<typeof tenantSchema>

export function tenantSchemaTable<T extends TenantTable>(
  tenantSchema: string,
  table: T,
): T {
  return new Proxy(table, new TableSchemaProxyHandler(tenantSchema))
}

/**
 * Alias for tenantSchemaTable
 */
export const tSchema = tenantSchemaTable
