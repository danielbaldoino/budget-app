import { i18n } from '@/lib/languages'
import { sdk } from '@/lib/sdk'
import { useAuthStore } from '@/store/auth-store'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useEffect } from 'react'
import { Toast } from 'toastify-react-native'

export function useSession() {
  const { token, setToken } = useAuthStore()

  const isAuthenticated = Boolean(token)

  const signIn = ({ token }: { token: string }) => setToken(token)
  const signOut = () => setToken(null)

  const {
    isLoading: isLoadingUser,
    data,
    error,
  } = sdk.v1.$reactQuery.useGetUserProfile({
    query: { enabled: isAuthenticated },
  })

  const user = data?.user

  useEffect(() => {
    if (error?.status !== 401) {
      return
    }

    notificationAsync(NotificationFeedbackType.Error)
    signOut()
    Toast.error(i18n.t('session.errors.expired'))
  }, [error])

  return {
    isAuthenticated,
    isLoadingUser,
    user,
    signIn,
    signOut,
  }
}
