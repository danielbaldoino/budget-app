import { env } from '@/lib/env'
import { getHeaders } from '@/lib/headers'
import { createClient } from '@workspace/sdk/platform'

export const sdk = createClient({
  baseURL: `${env.NEXT_PUBLIC_WEB_URL}`,
  headers: getHeaders,
})
