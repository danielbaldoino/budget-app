import { and, eq, ne } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetUserParams = {
  tenant: string
  userId: string
}

export async function getUser(params: GetUserParams) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const user = await tenantDb(params.tenant).query.users.findFirst({
      where: eq(users.id, params.userId),
    })

    return user || null
  })
}

type GetUserWithRelationsParams = {
  tenant: string
  userId: string
}

export async function getUserWithRelations(params: GetUserWithRelationsParams) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const user = await tenantDb(params.tenant).query.users.findFirst({
      where: eq(users.id, params.userId),
      with: {
        seller: true,
      },
    })

    return user || null
  })
}

type GetUserByUsernameParams = {
  tenant: string
  username: string
  not?: { userId: string }
}

export async function getUserByUsername(params: GetUserByUsernameParams) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const user = await tenantDb(params.tenant).query.users.findFirst({
      where: and(
        params.not ? ne(users.id, params.not.userId) : undefined,
        eq(users.username, params.username),
      ),
    })

    return user || null
  })
}
