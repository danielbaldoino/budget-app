import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import type { FastifyTypedInstance } from '@/types/fastify'
import { verifyPassword } from '@workspace/auth'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { z } from 'zod'

export async function logIn(app: FastifyTypedInstance) {
  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Authenticate account and obtain JWT token',
        body: z.object({
          username: z.string().min(3).max(30),
          password: z.string().min(6).max(100),
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
      const { username, password } = request.body

      const [user] = await request.internal.tenantSchema(({ users }) =>
        db
          .select({
            id: users.id,
            password: users.password,
          })
          .from(users)
          .where(eq(users.username, username))
          .limit(1),
      )

      if (!user) {
        throw new BadRequestError({
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        })
      }

      const isPasswordValid = await verifyPassword({
        password,
        hash: user.password,
      })

      if (!isPasswordValid) {
        throw new BadRequestError({
          code: 'PASSWORD_INVALID',
          message: 'Password is invalid.',
        })
      }

      const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '30d' })

      return reply.status(201).send({ token })
    },
  )
}
