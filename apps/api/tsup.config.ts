import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.{ts,tsx}'],
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: [
    '@workspace/auth',
    '@workspace/cache',
    '@workspace/db',
    '@workspace/env',
    '@workspace/storage',
    '@workspace/utils',
  ],
})
