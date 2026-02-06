import { useAppearance } from '@/hooks/use-appearance'
import { useSession } from '@/hooks/use-session'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'

export function useProfileViewModel() {
  const { isLoadingUser, user, signOut } = useSession()
  const { toggleTheme } = useAppearance()

  const withSoftHaptic = (fn: () => void) => () => {
    impactAsync(ImpactFeedbackStyle.Soft)
    fn()
  }

  const handleSignOut = withSoftHaptic(signOut)
  const handleToggleTheme = withSoftHaptic(toggleTheme)

  return {
    isLoading: isLoadingUser,
    user,
    handleSignOut,
    handleToggleTheme,
  }
}
