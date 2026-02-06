import { useAppearance } from '@/hooks/use-appearance'
import { useSession } from '@/hooks/use-session'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'

export function useProfileViewModel() {
  const { isLoadingUser, user, logOut } = useSession()
  const { toggleTheme } = useAppearance()

  const signOut = () => {
    impactAsync(ImpactFeedbackStyle.Soft)
    logOut()
  }

  const onToggleTheme = () => {
    impactAsync(ImpactFeedbackStyle.Soft)
    toggleTheme()
  }

  return {
    isLoading: isLoadingUser,
    user,
    signOut,
    onToggleTheme,
  }
}
