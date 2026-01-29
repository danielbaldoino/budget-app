import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { resolveTenantByWorkspaceOwner } from '@/http/functions/tenant-resolver'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword } from '@workspace/auth'
import { db, orm } from '@workspace/db'
import { z } from 'zod'

export async function createUser(app: FastifyTypedInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['User'],
        description: 'Create a new user',
        operationId: 'createUser',
        body: z.object({
          name: z.string().trim().min(3),
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
      const { user: authUser } = request.platform

      const tenant = await resolveTenantByWorkspaceOwner(authUser.id)

      const { name, username, password } = request.body

      const userByUsername = await tenant.schema(({ users }) =>
        tenant.db.query.users.findFirst({
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

      const user = await db.transaction(async (tx) =>
        tenant.schema(async ({ users, sellers }) => {
          const [user] = await tx
            .insert(users)
            .values({
              username,
              passwordHash: hashedPassword,
            })
            .returning()

          if (!user) {
            throw new BadRequestError({
              code: 'USER_CREATION_FAILED',
              message: 'Failed to create user',
            })
          }

          await tx.insert(sellers).values({
            userId: user.id,
            name,
          })

          return user
        }),
      )

      return reply.status(201).send({ userId: user.id })
    },
  )
}
