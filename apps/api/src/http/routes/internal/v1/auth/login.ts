import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { tenantDatabase } from '@/http/middlewares/internal/tenant-database'
import type { FastifyTypedInstance } from '@/types/fastify'
import { hashPassword, verifyPassword } from '@workspace/auth'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { users } from '@workspace/db/tenant/schema'
import { z } from 'zod'

export async function getProfile(app: FastifyTypedInstance) {
  app
    .register(tenantDatabase)

    .post(
      '/auth/login',
      {
        schema: {
          tags: ['Auth'],
          description: 'Login user and get authentication token',
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

        const [user] = await request.internal.tenantDb(
          db
            .select({
              id: users.id,
              password: users.password,
            })
            .from(users)
            .where(eq(users.username, username)),
        )

        if (!user) {
          throw new BadRequestError({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials.',
          })
        }

        const hashedPassword = await hashPassword(password)
        const isPasswordValid = await verifyPassword({
          password: hashedPassword,
          hash: user.password,
        })

        if (!isPasswordValid) {
          throw new BadRequestError({
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials.',
          })
        }

        const token = await reply.jwtSign(
          { sub: user.id },
          { expiresIn: '30d' },
        )

        return reply.status(201).send({ token })
      },
    )
}
