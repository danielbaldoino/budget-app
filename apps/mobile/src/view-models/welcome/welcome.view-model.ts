import { router } from 'expo-router'

export function useWelcomeViewModel() {
  return {
    handleGoToSignIn: () => router.push('sign-in'),
  }
}
