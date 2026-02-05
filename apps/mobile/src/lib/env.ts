import { env as baseEnv, createEnv, z } from '@workspace/env'

export const env = createEnv({
  extends: [baseEnv],
  shared: {
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_OS: z.enum(['ios', 'android', 'web']).default('web'),
  },
  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_OS: process.env.EXPO_OS,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.CI,
})
