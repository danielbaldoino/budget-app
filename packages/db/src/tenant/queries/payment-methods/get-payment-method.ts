import { eq } from 'drizzle-orm'
import { tenantDb, tenantSchema } from '../../../tenant'

type GetPaymentMethodParams = {
  tenant: string
  paymentMethodId: string
}

export async function getPaymentMethod(params: GetPaymentMethodParams) {
  return tenantSchema(params.tenant, async ({ paymentMethods }) => {
    const paymentMethod = await tenantDb(
      params.tenant,
    ).query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, params.paymentMethodId),
    })

    return paymentMethod || null
  })
}
