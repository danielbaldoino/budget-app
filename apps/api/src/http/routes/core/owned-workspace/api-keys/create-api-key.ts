import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function createApiKey(app: FastifyTypedInstance) {
  app.register(authenticate).post(
    '/owned-workspace/api-keys',
    {
      schema: {
        tags: ['API Keys'],
        description: 'Create a new api key',
        operationId: 'createApiKey',
        body: z.object({
          name: z.string(),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              token: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const {
        user: { id: userId },
      } = request.authSession

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, userId))
        .limit(1)

      if (!workspace) {
        throw new BadRequestError({
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      if (!workspace.tenantSchemaId) {
        throw new BadRequestError({
          code: 'TENANT_SCHEMA_NOT_FOUND',
          message: 'Tenant schema not found for workspace',
        })
      }

      const [tenant] = await db
        .select({
          schemaName: tenantSchemas.schemaName,
        })
        .from(tenantSchemas)
        .where(eq(tenantSchemas.id, workspace.tenantSchemaId))
        .limit(1)

      if (!tenant) {
        throw new BadRequestError({
          code: 'TENANT_SCHEMA_NOT_FOUND',
          message: 'Tenant schema not found for workspace',
        })
      }

      const { name } = request.body

      const token = generateRandomToken()

      const [apiKeyCreated] = await tenantSchemaTables(
        tenant.schemaName,
        async ({ apiKeys }) =>
          await db
            .insert(apiKeys)
            .values({
              name,
              token,
            })
            .returning(),
      )

      if (!apiKeyCreated) {
        throw new BadRequestError({
          code: 'API_KEY_CREATION_FAILED',
          message: 'Failed to create API key',
        })
      }

      return reply.status(201).send({
        token,
      })
    },
  )
}

function generateRandomToken() {
  const repeatCount = 3
  let str = 'key_'

  for (let i = 0; i < repeatCount; i++) {
    str += Math.random().toString(36).substring(2, 15)
  }

  return str
}
