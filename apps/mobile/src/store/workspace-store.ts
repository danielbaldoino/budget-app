import { asyncStorage } from '@/lib/storages/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface WorkspaceStore {
  isHydrate: boolean
  workspaceId: string | null
  setWorkspaceId: (workspaceId: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      isHydrate: false,
      workspaceId: null,
      setWorkspaceId: (workspaceId: string | null) =>
        set(() => ({ workspaceId })),
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => asyncStorage),
      onRehydrateStorage: () => () =>
        useWorkspaceStore.setState({ isHydrate: true }),
    },
  ),
)
