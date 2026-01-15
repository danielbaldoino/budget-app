import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { tenantSchema } from '../../../tenant'

type GetApiKeyParams = {
  tenant: string
  apiKeyId: string
}

export async function getApiKey(params: GetApiKeyParams) {
  return tenantSchema(params.tenant, async ({ apiKeys }) => {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, params.apiKeyId))
      .limit(1)

    return apiKey || null
  })
}
