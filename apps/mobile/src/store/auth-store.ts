import { asyncStorage } from '@/lib/storages/async-storage'
import { secureStoreStorage } from '@/lib/storages/secure-store-storage'
import { Platform } from 'react-native'
import { create } from 'zustand'
import {
  type StateStorage,
  createJSONStorage,
  persist,
} from 'zustand/middleware'

interface AuthStore {
  isHydrate: boolean
  token: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isHydrate: false,
      token: null,
      setToken: (token: string | null) => set(() => ({ token })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        Platform.select<StateStorage>({
          web: asyncStorage,
          default: secureStoreStorage,
        }),
      ),
      onRehydrateStorage: () => () =>
        useAuthStore.setState({ isHydrate: true }),
    },
  ),
)
