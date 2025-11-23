# Budget App - AI Coding Agent Instructions

## Architecture Overview

This is a **multi-tenant SaaS budget/inventory management application** built as a pnpm/Turborepo monorepo with:
- **apps/api**: Fastify REST API with OpenAPI/Scalar docs
- **apps/web**: Next.js 15 frontend (App Router, Turbopack)
- **packages/**: 11 shared workspace packages (auth, db, cache, email, storage, sdk, ui, etc.)

### Multi-Tenancy Pattern (Critical)

The app uses **PostgreSQL schema-based multi-tenancy**:
- Main `public` schema: `tenant_schemas`, `workspaces`, Better Auth tables
- Each workspace gets a **separate PostgreSQL schema** (e.g., `tenant_abc123`)
- Tenant data (products, customers, orders, inventory) lives in these isolated schemas
- Access requires `x-tenant` (tenant schema ID) OR `x-workspace` (workspace slug) header

**Key files:**
- `packages/db/src/tenant/schema/index.ts`: `createTenantSchema()` - dynamically generates Drizzle schema for any tenant
- `packages/db/src/tenant/tenant-db.ts`: `tenantDb(schemaName)` - creates tenant-specific Drizzle instance
- `apps/api/src/http/middlewares/internal/tenant-database.ts`: Validates headers and injects `request.internal.tenant`, `request.internal.tenantDb`, `request.internal.tenantSchema` into Fastify requests

### Database Patterns

**Two separate Drizzle setups:**
1. **Main DB** (`packages/db/src/db.ts`): Public schema only - workspaces, tenant registry, auth
2. **Tenant DB** (`packages/db/src/tenant/tenant-db.ts`): Dynamic per-tenant schemas

**Schema definition pattern:**
```typescript
// Main schema (public)
export const workspaces = pgTable('workspaces', { ...id, slug: text('slug') })

// Tenant schema (dynamic)
export function createTenantSchema(schema?: string) {
  const tenantSchema = pgSchema(schema ?? TENANT_MIGRATIONS_SCHEMA)
  const products = tenantSchema.table('products', { ...id, name: text('name') })
  return { products, customers, ... }
}
```

**Migrations:**
- Main: `drizzle-kit` in `packages/db/` (standard flow)
- Tenant: Custom migrator in `packages/db/src/tenant/migrator.ts` - applies SQL to specific schemas

## Development Workflows

### Starting the stack
```bash
# Terminal 1: Start Postgres + Redis
docker compose up -d

# Terminal 2: Run dev servers (API on :3333, Web on :3000)
pnpm dev

# Access API docs: http://localhost:3333/api/docs
```

### Environment setup
All apps/packages use `pnpm with-env` (wraps `dotenv-cli`) to load **root-level `.env`**:
```json
"scripts": {
  "dev": "pnpm with-env next dev --turbopack",
  "with-env": "dotenv -e ../../.env --"
}
```

**Never create per-package `.env` files** - centralize in monorepo root.

### Code quality
- **Linter/Formatter**: Biome (not ESLint/Prettier) - `pnpm lint`, `pnpm format`
- **Biome config**: Root `biome.json` - enforces `noUnusedImports`, block statements, sorted Tailwind classes
- Run `biome check .` before committing

### SDK Generation (Critical workflow)

The web app uses **type-safe auto-generated SDK** from API OpenAPI spec:

```bash
# 1. Start API in dev mode (exposes /api/docs/openapi.json)
cd apps/api && pnpm dev

# 2. Generate SDK (Kubb reads live OpenAPI, generates types/schemas/React Query hooks)
cd packages/sdk && pnpm sdk:generate
```

**Generated files** (`packages/sdk/src/api/generated/`):
- `types/`: TypeScript interfaces
- `schemas/`: Zod schemas (validated forms)
- `react-query/hooks/`: TanStack Query hooks (auto-configured fetching)

**Web app usage:**
```typescript
import { sdk } from '@/lib/sdk' // Configured with auth headers
const { data } = sdk.$reactQuery.useListProducts() // Type-safe hook
```

**When to regenerate:** After adding/modifying API routes with Zod schemas

## Route/API Patterns

### Fastify route structure
```typescript
// apps/api/src/http/routes/internal/v1/products/create-product.ts
export async function createProduct(app: FastifyTypedInstance) {
  app.post('/products', {
    schema: {
      tags: ['Products'],
      operationId: 'createProduct', // SDK hook name
      body: z.object({ name: z.string() }),
      response: withDefaultErrorResponses({
        201: z.object({ productId: z.string() })
      })
    }
  }, async (request, reply) => {
    const { tenant, tenantDb } = request.internal // Injected by middleware
    const productId = await queries.tenant.products.createProduct({
      tenant, data: request.body
    })
    return reply.status(201).send({ productId })
  })
}
```

**Conventions:**
- One route per file, exported named function
- Register in parent `index.ts` via `app.register(createProduct)`
- Use `queries.tenant.*` for tenant operations (in `packages/db/src/queries/`)
- Throw typed errors: `BadRequestError`, `UnauthorizedError`, `NotFoundError`

### Route middleware composition

**Public routes** (no auth):
```typescript
app.register(health) // No middleware
```

**Authenticated routes** (Better Auth session):
```typescript
import { authenticate } from '@/http/middlewares/authenticate'
app.register(async (app) => {
  app.register(authenticate) // Injects request.authSession
  app.register(getProfile)
})
```

**Internal/tenant routes** (workspace-scoped):
```typescript
import { tenantDatabase } from '@/http/middlewares/internal/tenant-database'
import { jwtAuth } from '@/http/middlewares/internal/jwt-auth' // OR apiKeyAuth
app.register(async (app) => {
  app.register(jwtAuth) // API authentication
  app.register(tenantDatabase) // Injects request.internal.tenant/tenantDb
  app.register(createProduct)
})
```

## Authentication & Authorization

### Better Auth (packages/auth/)
- Session-based auth for web app (cookie: `budget-app.session_token`)
- Supports email/password + GitHub OAuth
- Email verification required (Resend integration in `packages/email/`)
- Config: `packages/auth/src/auth.ts`

### API Authentication (internal routes)
Two methods (choose one per route group):
1. **JWT** (`internal/jwt-auth.ts`): Verifies `Authorization: Bearer <token>` header
2. **API Key** (`internal/api-key-auth.ts`): Verifies `x-api-key` header against tenant `api_keys` table

Both inject `request.internal.apiKey` or `request.internal.jwt` for downstream use.

## Package Structure

### Workspace packages (@workspace/*)
- **db**: Drizzle ORM, migrations, tenant logic, reusable queries
- **auth**: Better Auth config + client utilities
- **cache**: Redis client (ioredis, env: `REDIS_URL`)
- **storage**: S3-compatible storage (env: `STORAGE_*`)
- **email**: Resend + React Email templates
- **sdk**: Auto-generated API client (Kubb + OpenAPI)
- **ui**: Shadcn/ui components (Radix + Tailwind)
- **utils**: Shared TypeScript utilities
- **env**: Centralized Zod env validation

### Env validation pattern
Each package with env needs validates locally:
```typescript
// packages/db/src/lib/env.ts
import { z } from 'zod'
const schema = z.object({ DATABASE_URL: z.string().url() })
export const env = schema.parse(process.env)
```

## Common Patterns

### ID Generation
Use `generateId()` from `@workspace/db` (wraps `crypto.randomUUID()`):
```typescript
import { generateId } from '@workspace/db'
const id = generateId() // '550e8400-e29b-41d4-a716-446655440000'
```

### Timestamps & Metadata
Reusable Drizzle column sets:
```typescript
import { id, timestamps, metadata } from '@workspace/db/utils'
const products = tenantSchema.table('products', {
  ...id, // id: text('id').primaryKey()
  name: text('name'),
  ...timestamps, // created_at, updated_at
  ...metadata, // jsonb('metadata')
})
```

### Error Handling
Throw domain errors (auto-handled by `errorHandler`):
```typescript
import { BadRequestError, UnauthorizedError, NotFoundError } from '@/http/errors'
if (!product) throw new NotFoundError({ message: 'Product not found' })
```

### Query Pattern
Centralize data access in `packages/db/src/queries/`:
```typescript
// queries/tenant/products.ts
export const getProduct = async ({ tenant, productId }) => {
  return tenantSchema(tenant, async (schema) => {
    return tenantDb(tenant).query.products.findFirst({
      where: orm.eq(schema.products.id, productId)
    })
  })
}
```

## Key Gotchas

1. **Don't use `request.server.db` for tenant data** - use `request.internal.tenantDb()`
2. **API routes need explicit `app.register()` in parent** - auto-discovery not enabled
3. **Biome format fails if you use semicolons inconsistently** - run `pnpm format` to fix
4. **SDK regeneration requires API server running** - Kubb fetches live OpenAPI
5. **Tenant migrations must use custom migrator** - `drizzle-kit` only handles public schema
6. **Next.js middleware runs on edge** - can't use Node.js APIs directly

## Project-Specific Tooling

- **Package manager**: pnpm (strict, `packageManager` field locked)
- **Build orchestration**: Turborepo (see `turbo.json`)
- **Node version**: >=20 (check `package.json` engines)
- **Database client**: Drizzle ORM + node-postgres
- **HTTP client**: TanStack Query (React) / native fetch (server)
- **UI framework**: Radix UI + Tailwind + CVA (Class Variance Authority)
