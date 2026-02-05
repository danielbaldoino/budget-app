import * as v1_operations from './api/generated/v1/operations'
import * as v1_hooks from './api/generated/v1/react-query/hooks'
import * as v1_schemas from './api/generated/v1/schemas'
import * as v1_types from './api/generated/v1/types'

import { setConfig } from '../lib/config'

type ClientOptions = {
  baseURL?: string
  headers?: HeadersInit | (() => Promise<HeadersInit | undefined>)
}

export function createClient(options: ClientOptions) {
  setConfig({
    baseURL: options.baseURL,
    headers: options.headers,
  })

  return {
    v1: {
      ...v1_operations,
      $reactQuery: v1_hooks,
      $schemas: v1_schemas,
      $types: v1_types,
    },
  }
}
