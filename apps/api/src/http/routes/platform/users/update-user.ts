import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
import { z } from 'zod'

export async function updateUser(app: FastifyTypedInstance) {
  app.patch(
    '/users/:userId',
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
      const { user: authUser } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(authUser.id)

      const { userId } = request.params
      const { name, username, password } = request.body

      const user = await tenant.schema(({ users }) =>
        tenant.db.query.users.findFirst({
          where: orm.eq(users.id, userId),
        }),
      )

      if (!user) {
        throw new BadRequestError({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        })
      }

      if (username) {
        const userByUsername = await tenant.queries.users.getUserByUsername({
          tenant: tenant.name,
          username,
          not: { userId },
        })

        if (userByUsername) {
          throw new BadRequestError({
            code: 'USERNAME_ALREADY_EXISTS',
            message: 'Username already exists',
          })
        }
      }

      const passwordHash = password ? await hashPassword(password) : undefined

      await tenantSchema(tenant.name, ({ users }) =>
        tenantDb(tenant.name)
          .update(users)
          .set({
            name,
            username,
            passwordHash,
          })
          .where(orm.eq(users.id, userId)),
      )

      return reply.status(204).send()
    },
  )
}
