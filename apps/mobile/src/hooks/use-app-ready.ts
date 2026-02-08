import { useAuthStore } from '@/store/auth-store'
import { useWorkspaceStore } from '@/store/workspace-store'
import { useEffect, useState } from 'react'

export function useAppReady() {
  const [isMounted, setIsMounted] = useState(false)
  const { isHydrated: isAuthHydrated } = useAuthStore()
  const { isHydrated: isWorkspaceHydrated } = useWorkspaceStore()

  const isHydrated = isAuthHydrated && isWorkspaceHydrated
  const isAppReady = isHydrated && isMounted

  useEffect(() => setIsMounted(true), [])

  return {
    isAppReady,
    isHydrated,
    isMounted,
  }
}
