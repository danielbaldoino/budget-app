import {
  type GetColumnData,
  type SQL,
  type Simplify,
  getTableColumns,
  getTableName,
  sql,
} from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'

import { db } from '../db'

type WithRelations = {
  [key: string]:
    | ReturnType<typeof buildRelationManyQuery>
    | ReturnType<typeof buildRelationFirstQuery>
}

function buildJsonObjectWithRelations(
  cols: Record<string, PgColumn | SQL | SQL.Aliased>,
  relations?: WithRelations,
) {
  const entries: (PgColumn | SQL | SQL.Aliased)[] = []

  // Add base columns
  for (const [key, col] of Object.entries(cols)) {
    entries.push(sql.raw(`'${key.replace(/'/g, "''")}'`))
    entries.push(col)
  }

  // Add relations
  if (relations && Object.keys(relations).length) {
    for (const [key, relationQuery] of Object.entries(relations)) {
      entries.push(sql.raw(`'${key.replace(/'/g, "''")}'`))
      entries.push(relationQuery.data as unknown as SQL)
    }
  }

  return sql`json_build_object(${sql.join(entries, sql`, `)})`
}

type DataType<T> = Simplify<{
  [K in keyof T]: T[K] extends SQL | SQL.Aliased
    ? T[K]['_']['type']
    : T[K] extends PgColumn
      ? GetColumnData<T[K]>
      : never
}>

type BuildRelationManyQueryParams<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
> = {
  as?: string
  table: TTable
  columns?: TColumns
  where?: SQL
  orderBy?: SQL | SQL[]
  limit?: number
  offset?: number
  with?: WithRelations
}

export function buildRelationManyQuery<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>(
  params: Omit<BuildRelationManyQueryParams<TTable, TColumns>, 'columns'> & {
    columns: TColumns
  },
): ReturnType<typeof buildRelationManyQueryImpl<TTable, TColumns>>
export function buildRelationManyQuery<TTable extends PgTable>(
  params: Omit<BuildRelationManyQueryParams<TTable, never>, 'columns'> & {
    columns?: never
  },
): ReturnType<
  typeof buildRelationManyQueryImpl<
    TTable,
    ReturnType<typeof getTableColumns<TTable>>
  >
>
export function buildRelationManyQuery<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>({
  as,
  table,
  columns,
  where,
  orderBy,
  limit,
  offset,
  with: relations,
}: BuildRelationManyQueryParams<TTable, TColumns>) {
  return buildRelationManyQueryImpl({
    as,
    table,
    columns,
    where,
    orderBy,
    limit,
    offset,
    with: relations,
  })
}

function buildRelationManyQueryImpl<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>({
  as,
  table,
  columns,
  where,
  orderBy,
  limit,
  offset,
  with: relations,
}: BuildRelationManyQueryParams<TTable, TColumns>) {
  const alias = as ?? getTableName(table)
  const cols = columns ?? getTableColumns<TTable>(table)

  let query = db
    .select({
      data: sql<
        DataType<
          TColumns extends never
            ? ReturnType<typeof getTableColumns<TTable>>
            : TColumns
        >[]
      >`COALESCE(
        json_agg(${buildJsonObjectWithRelations(cols, relations)}),
        '[]'::json
      )`.as(alias),
    })
    .from(table as PgTable)

  if (relations && Object.keys(relations).length) {
    for (const [, relationQuery] of Object.entries(relations)) {
      query = query.leftJoinLateral(
        relationQuery,
        sql`true`,
      ) as unknown as typeof query
    }
  }

  if (where) {
    query = query.where(where) as typeof query
  }

  if (orderBy) {
    const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy]
    query = query.orderBy(...orderByArray) as typeof query
  }

  if (limit !== undefined) {
    query = query.limit(limit) as typeof query
  }

  if (offset !== undefined) {
    query = query.offset(offset) as typeof query
  }

  return query.as(getTableName(table))
}

type BuildRelationFirstQueryParams<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
> = {
  as?: string
  table: TTable
  columns?: TColumns
  where?: SQL
  orderBy?: SQL | SQL[]
  with?: WithRelations
}

export function buildRelationFirstQuery<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>(
  params: Omit<BuildRelationFirstQueryParams<TTable, TColumns>, 'columns'> & {
    columns: TColumns
  },
): ReturnType<typeof buildRelationFirstQueryImpl<TTable, TColumns>>
export function buildRelationFirstQuery<TTable extends PgTable>(
  params: Omit<BuildRelationFirstQueryParams<TTable, never>, 'columns'> & {
    columns?: never
  },
): ReturnType<
  typeof buildRelationFirstQueryImpl<
    TTable,
    ReturnType<typeof getTableColumns<TTable>>
  >
>
export function buildRelationFirstQuery<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>({
  as,
  table,
  columns,
  where,
  orderBy,
  with: relations,
}: BuildRelationFirstQueryParams<TTable, TColumns>) {
  return buildRelationFirstQueryImpl({
    as,
    table,
    columns,
    where,
    orderBy,
    with: relations,
  })
}

function buildRelationFirstQueryImpl<
  TTable extends PgTable,
  TColumns extends Record<string, PgColumn | SQL | SQL.Aliased>,
>({
  as,
  table,
  columns,
  where,
  orderBy,
  with: relations,
}: BuildRelationFirstQueryParams<TTable, TColumns>) {
  const alias = as ?? getTableName(table)
  const cols = columns ?? getTableColumns<TTable>(table)

  let query = db
    .select({
      data: sql<DataType<
        TColumns extends never
          ? ReturnType<typeof getTableColumns<TTable>>
          : TColumns
      > | null>`COALESCE(
        ${buildJsonObjectWithRelations(cols, relations)},
        NULL
      )`.as(alias),
    })
    .from(table as PgTable)

  if (relations && Object.keys(relations).length) {
    for (const [, relationQuery] of Object.entries(relations)) {
      query = query.leftJoinLateral(
        relationQuery,
        sql`true`,
      ) as unknown as typeof query
    }
  }

  if (where) {
    query = query.where(where) as typeof query
  }

  if (orderBy) {
    const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy]
    query = query.orderBy(...orderByArray) as typeof query
  }

  query = query.limit(1) as typeof query

  return query.as(getTableName(table))
}
