import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth-store'
import { useWorkspaceStore } from '@/store/workspace-store'
import { createClient } from '@workspace/sdk/application'

export const sdk = createClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
  headers: async () => {
    // Get authentication details from the store
    const { token } = useAuthStore.getState()
    const { workspaceId } = useWorkspaceStore.getState()

    // Define common headers for API requests
    const APPLICATION_JSON = 'application/json'

    return {
      'Content-Type': APPLICATION_JSON,
      Accept: APPLICATION_JSON,
      'x-workspace': workspaceId || '',
      Authorization: `Bearer ${token}`,
    }
  },
})
