import { type UserConfig, defineConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { type Exclude, pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { env } from './src/lib/env'

const exclude: Exclude[] = [
  {
    type: 'path',
    pattern: '/internal/',
  },
] as const

export const config: UserConfig = {
  name: 'Budget App API',
  root: '.',
  input: {
    path: `${env.API_URL}/api/docs/openapi.json`,
  },
  output: {
    path: './src/api/generated',
    clean: true,
    extension: {
      '.ts': '',
    },
  },
  hooks: {
    done: ['pnpm run sdk:generate:format'],
  },
  plugins: [
    pluginOas({
      validate: false,
      generators: [],
    }),
    pluginTs({
      output: {
        path: './types',
      },
      exclude,
    }),
    pluginZod({
      output: {
        path: './schemas',
      },
      typed: true,
      inferred: true,
      exclude,
    }),
    pluginClient({
      importPath: '../../../../client/fetch-react-query',
      dataReturnType: 'data',
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      output: {
        path: './react-query/operations',
        barrelType: false,
      },
      exclude,
    }),
    pluginReactQuery({
      client: {
        importPath: '../../../../client/fetch-react-query',
        dataReturnType: 'data',
      },
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      suspense: false,
      output: {
        path: './react-query/hooks',
      },
      exclude,
    }),
    pluginClient({
      importPath: '../../../client/fetch',
      dataReturnType: 'full',
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      output: {
        path: './operations',
      },
      exclude,
    }),
  ],
}

export default defineConfig(config)
