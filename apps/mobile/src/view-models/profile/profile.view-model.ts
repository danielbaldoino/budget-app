import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { useAppearance } from '@/hooks/use-appearance'
import { useSession } from '@/hooks/use-session'

export function useProfileViewModel() {
  const { isLoadingUser, user, logOut } = useSession()
  const { toggleTheme } = useAppearance()

  const signOut = () => {
    impactAsync(ImpactFeedbackStyle.Heavy)
    logOut()
  }

  return {
    isLoading: isLoadingUser,
    user,
    signOut,
    toggleTheme: () => {
      impactAsync(ImpactFeedbackStyle.Heavy)
      toggleTheme()
    },
  }
}
