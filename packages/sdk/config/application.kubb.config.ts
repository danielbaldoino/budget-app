import { type UserConfig, defineConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { type Include, pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'
import { env } from '../src/lib/env'

function pluginWithVersion(version: string) {
  const include: Include[] = [
    {
      type: 'path',
      pattern: `/api/application/${version}`,
    },
  ] as const

  return [
    pluginTs({
      output: {
        path: `./${version}/types`,
      },
      include,
    }),
    pluginZod({
      output: {
        path: `./${version}/schemas`,
      },
      typed: true,
      inferred: true,
      include,
    }),
    pluginClient({
      importPath: '../../../../../client/fetch-react-query',
      dataReturnType: 'data',
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      output: {
        path: `./${version}/react-query/operations`,
        barrelType: false,
      },
      include,
    }),
    pluginReactQuery({
      client: {
        importPath: '../../../../../client/fetch-react-query',
        dataReturnType: 'data',
      },
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      output: {
        path: `./${version}/react-query/hooks`,
      },
      include,
    }),
    pluginClient({
      importPath: '../../../../client/fetch',
      dataReturnType: 'full',
      // parser: 'zod',
      paramsType: 'object',
      pathParamsType: 'object',
      output: {
        path: `./${version}/operations`,
      },
      include,
    }),
  ]
}

const config: UserConfig = {
  name: 'Budget App API - Application',
  root: '.',
  input: {
    path: `${env.API_URL}/api/docs/openapi.json`,
  },
  output: {
    path: './src/application/api/generated',
    clean: true,
    extension: {
      '.ts': '',
    },
  },
  hooks: {
    done: ['pnpm run sdk:generate:format:application'],
  },
  plugins: [
    pluginOas({
      validate: false,
      generators: [],
    }),
    ...pluginWithVersion('v1'),
  ],
}

export default defineConfig(config) as UserConfig
