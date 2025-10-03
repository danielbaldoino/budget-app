import { BadRequestError } from '@/http/errors/bad-request-error'
import { withDefaultErrorResponses } from '@/http/errors/default-error-responses'
import { authenticate } from '@/http/middlewares/authenticate'
import type { FastifyTypedInstance } from '@/types/fastify'
import { db } from '@workspace/db'
import { and, eq, ne } from '@workspace/db/orm'
import { workspaces } from '@workspace/db/schema'
import { createSlug } from '@workspace/utils'
import { z } from 'zod'

export async function updateOwnedWorkspace(app: FastifyTypedInstance) {
  app.register(authenticate).patch(
    '/owned-workspace',
    {
      schema: {
        tags: ['Owned Workspace'],
        description: 'Update owned workspace details',
        operationId: 'updateOwnedWorkspace',
        body: z.object({
          name: z.string().optional(),
          slug: z.string().transform(createSlug).optional(),
          active: z.boolean().optional(),
          logoUrl: z.string().url().nullish(),
        }),
        response: withDefaultErrorResponses({
          204: z.null().describe('Success'),
        }),
      },
    },
    async (request, reply) => {
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

      const { name, slug, active, logoUrl } = request.body

      if (slug) {
        const [workspaceBySlug] = await db
          .select()
          .from(workspaces)
          .where(
            and(eq(workspaces.slug, slug), ne(workspaces.id, workspace.id)),
          )
          .limit(1)

        if (workspaceBySlug) {
          throw new BadRequestError({
            code: 'WORKSPACE_SLUG_ALREADY_IN_USE',
            message: 'This workspace slug is already in use',
          })
        }
      }

      await db
        .update(workspaces)
        .set({
          name,
          active,
          slug,
          logoUrl,
        })
        .where(eq(workspaces.id, workspace.id))

      return reply.status(204).send()
    },
  )
}
