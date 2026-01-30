import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetCarrierParams = {
  tenant: string
  carrierId: string
}

export async function getCarrier(params: GetCarrierParams) {
  return tenantSchema(params.tenant, async ({ carriers }) => {
    const carrier = await tenantDb(params.tenant).query.carriers.findFirst({
      where: eq(carriers.id, params.carrierId),
    })

    return carrier || null
  })
}
