'use client'

import { env } from '@/lib/env'
import { createAuthClient } from '@workspace/auth/client'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_WEB_URL,
})
