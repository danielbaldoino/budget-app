import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db, orm } from '@workspace/db'
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
                tenantSchemaId: z.string().nullable(),
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

      const workspace = await db.query.workspaces.findFirst({
        where: orm.eq(workspaces.ownerId, userId),
      })

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
