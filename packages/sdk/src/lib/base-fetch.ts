import { type RequestConfig, getConfig } from './config'
import { targetUrl } from './utils'

export async function baseFetch<TVariables>(
  paramsConfig: RequestConfig<TVariables>,
) {
  const globalConfig = getConfig()
  const config = { ...globalConfig, ...paramsConfig }

  const method = config.method?.toUpperCase()

  const response = await fetch(targetUrl(config), {
    credentials: config.credentials || 'same-origin',
    method: config.method?.toUpperCase(),
    body: method === 'GET' ? undefined : JSON.stringify(config.data || {}),
    signal: config.signal,
    headers: {
      ...(typeof globalConfig.headers === 'function'
        ? await globalConfig.headers()
        : globalConfig.headers),
      ...(paramsConfig.headers || {}),
    },
    ...(config.next && {
      next: {
        revalidate: config.next?.revalidate,
        tags: config.next?.tags,
      },
    }),
  })

  return response
}
