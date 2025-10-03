import { env as authEnv } from '@workspace/auth/env'
import { env as cacheEnv } from '@workspace/cache/env'
import { env as databaseEnv } from '@workspace/db/env'
import { env as baseEnv, createEnv, z } from '@workspace/env'
import { env as storageEnv } from '@workspace/storage/env'

export const env = createEnv({
  extends: [baseEnv, authEnv, cacheEnv, databaseEnv, storageEnv],
  server: {
    PORT: z.coerce.number().optional(),

    JWT_SECRET: z.string(),
    UPLOAD_SECRET: z.string(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,

    JWT_SECRET: process.env.JWT_SECRET,
    UPLOAD_SECRET: process.env.UPLOAD_SECRET,
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.CI,
})
