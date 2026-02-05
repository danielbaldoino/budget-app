import { router } from 'expo-router'

export function useWelcomeViewModel() {
  const handleGoToSignIn = () => router.push('sign-in')

  return {
    handleGoToSignIn,
  }
}
