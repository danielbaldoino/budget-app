import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
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

      const tSchema = await getTenantSchema({ workspaceOwnerId: user.id })

      const { name, username, password } = request.body

      const [userByUsername] = await tenantSchemaTables(
        tSchema,
        async ({ users }) =>
          await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1),
      )

      if (userByUsername) {
        throw new BadRequestError({
          code: 'USERNAME_ALREADY_EXISTS',
          message: 'Username already exists',
        })
      }

      const hashedPassword = await hashPassword(password)

      const [userCreated] = await tenantSchemaTables(
        tSchema,
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

      return reply.status(201).send()
    },
  )
}
