import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../tenant-db'

type GetApiKeyParams = {
  tenant: string
  apiKeyId: string
}

export async function getApiKey(params: GetApiKeyParams) {
  return tenantSchema(params.tenant, async ({ apiKeys }) => {
    const apiKey = await tenantDb(params.tenant).query.apiKeys.findFirst({
      where: eq(apiKeys.id, params.apiKeyId),
    })

    return apiKey || null
  })
}
