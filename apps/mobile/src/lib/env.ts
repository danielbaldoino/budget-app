import { env as baseEnv, createEnv, z } from '@workspace/env'

export const env = createEnv({
  extends: [baseEnv],
  shared: {
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_UNSTABLE_WEB_MODAL: z.enum(['0', '1']).optional(),
    EXPO_OS: z.enum(['ios', 'android', 'web']).default('web'),
  },
  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_UNSTABLE_WEB_MODAL: process.env.EXPO_UNSTABLE_WEB_MODAL,
    EXPO_OS: process.env.EXPO_OS,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.CI,
})
