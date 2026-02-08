import { HTTP_STATUS } from '@/constants/http'
import { i18n } from '@/lib/languages'
import { sdk } from '@/lib/sdk'
import { useAuthStore } from '@/store/auth-store'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useCallback, useEffect } from 'react'
import { Toast } from 'toastify-react-native'

export function useSession() {
  const { token, setToken } = useAuthStore()

  const isAuthenticated = Boolean(token)

  const signIn = useCallback(
    (newToken: string) => {
      setToken(newToken)
    },
    [setToken],
  )

  const signOut = useCallback(() => {
    setToken(null)
  }, [setToken])

  const { isLoading, isError, data, error } =
    sdk.v1.$reactQuery.useGetUserProfile({
      query: { enabled: isAuthenticated },
    })

  useEffect(() => {
    if (error?.status === HTTP_STATUS.UNAUTHORIZED) {
      notificationAsync(NotificationFeedbackType.Error)
      signOut()
      Toast.error(i18n.t('session.errors.expired'))
    }
  }, [error?.status, signOut])

  return {
    isAuthenticated,
    isLoading,
    isError,
    user: data?.user,
    signIn,
    signOut,
  }
}
