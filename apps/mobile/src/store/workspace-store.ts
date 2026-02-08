import { asyncStorage } from '@/lib/storages/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface WorkspaceStore {
  isHydrated: boolean
  workspaceId: string | null
  setWorkspaceId: (workspaceId: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      isHydrated: false,
      workspaceId: null,
      setWorkspaceId: (workspaceId: string | null) =>
        set(() => ({ workspaceId })),
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => asyncStorage),
      onRehydrateStorage: () => () =>
        useWorkspaceStore.setState({ isHydrated: true }),
    },
  ),
)
