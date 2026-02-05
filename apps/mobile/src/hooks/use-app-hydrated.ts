import { useAuthStore } from '@/store/auth-store'
import { useWorkspaceStore } from '@/store/workspace-store'

export function useAppHydrated() {
  const { isHydrate: isAuthHydrated } = useAuthStore()
  const { isHydrate: isWorkspaceHydrated } = useWorkspaceStore()

  const isHydrated = isAuthHydrated && isWorkspaceHydrated

  return { isHydrated }
}
