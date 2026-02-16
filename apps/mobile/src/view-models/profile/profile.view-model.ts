import { useAppearance } from '@/hooks/use-appearance'
import { useSession } from '@/hooks/use-session'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'

export function useProfileViewModel() {
  const { isLoading, user, signOut } = useSession()
  const { setThemePreference, toggleTheme } = useAppearance()

  const withSoftHaptic = (fn: () => void) => () => {
    impactAsync(ImpactFeedbackStyle.Soft)
    fn()
  }

  return {
    isLoading,
    user,
    handleSignOut: withSoftHaptic(signOut),
    handleSetSystemTheme: withSoftHaptic(() => setThemePreference('system')),
    handleToggleTheme: withSoftHaptic(toggleTheme),
  }
}
