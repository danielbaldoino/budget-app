import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { getTenantSchema } from '@/http/functions/core/get-tenant-schema'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { orm } from '@workspace/db'
import { tenantDb, tenantSchema } from '@workspace/db/tenant'
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
          username: z.string().trim().min(3).max(30),
          password: z.string().min(6).max(100),
        }),
        response: withDefaultErrorResponses({
          201: z
            .object({
              userId: z.string(),
            })
            .describe('Success'),
        }),
      },
    },
    async (request, reply) => {
      const {
        user: { id: userId },
      } = request.authSession

      const tSchema = await getTenantSchema({ workspaceOwnerId: userId })

      const { name, username, password } = request.body

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

      const hashedPassword = await hashPassword(password)

      const [user] = await tenantSchema(tSchema, ({ users }) =>
        tenantDb(tSchema)
          .insert(users)
          .values({
            name,
            username,
            passwordHash: hashedPassword,
          })
          .returning(),
      )

      if (!user) {
        throw new BadRequestError({
          code: 'USER_CREATION_FAILED',
          message: 'Failed to create user',
        })
      }

      return reply.status(201).send({ userId: user.id })
    },
  )
}
