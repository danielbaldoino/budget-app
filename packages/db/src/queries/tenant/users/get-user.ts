import { eq } from 'drizzle-orm'

import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

type GetUserParams = {
  tenant: string
  userId: string
}

export async function getUser(params: GetUserParams) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1)

    return user || null
  })
}

type GetUserByUsernameParams = {
  tenant: string
  username: string
}

export async function getUserByUsername(params: GetUserByUsernameParams) {
  return tenantSchema(params.tenant, async ({ users }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, params.username))
      .limit(1)

    return user || null
  })
}
