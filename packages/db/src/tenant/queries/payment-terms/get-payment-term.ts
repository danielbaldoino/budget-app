import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetPaymentTermParams = {
  tenant: string
  paymentTermId: string
}

export async function getPaymentTerm(params: GetPaymentTermParams) {
  return tenantSchema(params.tenant, async ({ paymentTerms }) => {
    const paymentTerm = await tenantDb(
      params.tenant,
    ).query.paymentTerms.findFirst({
      where: eq(paymentTerms.id, params.paymentTermId),
    })

    return paymentTerm || null
  })
}
