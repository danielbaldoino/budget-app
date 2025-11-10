import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
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
            username: z.string().trim().min(3).max(30).optional(),
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
        const userByUsername = await tenantSchema(tSchema, ({ users }) =>
          tenantDb(tSchema).query.users.findFirst({
            where: orm.eq(users.username, username),
          }),
        )

        if (userByUsername) {
          throw new BadRequestError({
            code: 'USERNAME_ALREADY_EXISTS',
            message: 'Username already exists',
          })
        }
      }

      const passwordHash = password ? await hashPassword(password) : undefined

      await tenantSchema(tSchema, ({ users }) =>
        tenantDb(tSchema)
          .update(users)
          .set({
            name,
            username,
            passwordHash,
          })
          .where(orm.eq(users.id, targetUserId)),
      )

      return reply.status(204).send()
    },
  )
}
