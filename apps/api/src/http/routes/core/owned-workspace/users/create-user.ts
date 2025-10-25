import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { tenantSchemas, workspaces } from '@workspace/db/schema'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function createUser(app: FastifyTypedInstance) {
  app.register(authenticate).post(
    '/owned-workspace/users',
    {
      schema: {
        tags: ['User'],
        description: 'Create a new user',
        operationId: 'createUser',
        body: z.object({
          name: z.string(),
          username: z.string().min(3).max(30),
          password: z.string().min(6).max(100),
        }),
        response: withDefaultErrorResponses({
          201: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { user } = request.authSession

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerId, user.id))
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

      const { name, username, password } = request.body

      const hashedPassword = await hashPassword(password)

      const [userCreated] = await tenantSchemaTables(
        tenant.schemaName,
        async ({ users }) =>
          await db
            .insert(users)
            .values({
              name,
              username,
              password: hashedPassword,
            })
            .returning(),
      )

      if (!userCreated) {
        throw new BadRequestError({
          code: 'USER_CREATION_FAILED',
          message: 'Failed to create user',
        })
      }

      // TODO: Send email to user with login credentials

      console.log('Send credentials to user:', {
        email: user.email,
        userCreated: {
          username: userCreated.username,
          password: userCreated.password,
        },
      })

      return reply.status(201).send()
    },
  )
}
