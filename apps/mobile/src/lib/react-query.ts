import { TIME } from '@/constants/validation'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TIME.FIVE_MINUTES,
      gcTime: TIME.FIVE_MINUTES,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: TIME.ONE_MINUTE,
    },
  },
})
