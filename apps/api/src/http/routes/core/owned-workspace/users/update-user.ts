import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { db } from '@workspace/db'
import { and, eq, ne } from '@workspace/db/orm'
import { tenantSchemaTables } from '@workspace/db/tenant'
import { z } from 'zod'

export async function updateUser(app: FastifyTypedInstance) {
  app.register(authenticate).patch(
    '/owned-workspace/users/:userId',
    {
      schema: {
        tags: ['User'],
        description: 'Update a user',
        operationId: 'updateUser',
        params: z.object({
          userId: z.string().uuid(),
        }),
        body: z
          .object({
            name: z.string().optional(),
            username: z.string().min(3).max(30).optional(),
            password: z.string().min(6).max(100).optional(),
          })
          .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided',
          }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const { user } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: user.id })

      const { userId: targetUserId } = request.params
      const { name, username, password } = request.body

      if (username) {
        const [userByUsername] = await tenantSchemaTables(
          tSchema,
          async ({ users }) =>
            await db
              .select()
              .from(users)
              .where(
                and(eq(users.username, username), ne(users.id, targetUserId)),
              )
              .limit(1),
        )

        if (userByUsername) {
          throw new BadRequestError({
            code: 'USERNAME_ALREADY_EXISTS',
            message: 'Username already exists',
          })
        }
      }

      await tenantSchemaTables(
        tSchema,
        async ({ users }) =>
          await db
            .update(users)
            .set({
              name,
              username,
              password: password ? await hashPassword(password) : undefined,
            })
            .where(eq(users.id, targetUserId)),
      )

      return reply.status(204).send()
    },
  )
}
