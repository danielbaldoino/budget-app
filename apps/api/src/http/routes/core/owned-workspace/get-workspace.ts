import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { eq } from '@workspace/db/orm'
import { workspaces } from '@workspace/db/schema'
import { z } from 'zod'

export async function getOwnedWorkspace(app: FastifyTypedInstance) {
  app.register(authenticate).get(
    '/owned-workspace',
    {
      schema: {
        tags: ['Owned Workspace'],
        description: 'Get details from owned workspace',
        operationId: 'getOwnedWorkspace',
        response: withDefaultErrorResponses({
          200: z
            .object({
              workspace: z.object({
                id: z.string(),
                active: z.boolean(),
                name: z.string(),
                slug: z.string(),
                logoUrl: z.string().url().nullable(),
                ownerId: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            })
            .describe('Success'),
        }),
      },
    },
    async (request) => {
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

      return { workspace }
    },
  )
}
