import { sdk } from '@/lib/sdk'
import { useAuthStore } from '@/store/auth-store'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { Toast } from 'toastify-react-native'

export function useSession() {
  const { token, setToken } = useAuthStore()

  const isAuthenticated = Boolean(token)
  const logIn = ({ token }: { token: string }) => setToken(token)
  const logOut = () => setToken(null)

  const {
    isLoading: isLoadingUser,
    data,
    error,
  } = sdk.v1.$reactQuery.useGetUserProfile({
    query: { enabled: isAuthenticated },
  })

  if (error) {
    // Handle unauthorized error globally
    const { status } = error

    if (status === 401) {
      notificationAsync(NotificationFeedbackType.Error)
      logOut()
      Toast.error('Sua sessão expirou. Por favor, faça login novamente.')
    }
  }

  const user = data?.user

  return {
    isAuthenticated,
    isLoadingUser,
    user,
    logIn,
    logOut,
  }
}
