import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useProfileViewModel } from './profile.view-model'

export function ProfileView() {
  const { isLoading, user, signOut, toggleTheme } = useProfileViewModel()

  return (
    <Screen androidBottomTabInset>
      <Payload payload={{ isLoading, user }} />

      <Button onPress={toggleTheme}>Alternar Tema</Button>

      <Button variant="destructive" onPress={signOut}>
        <Text>Sair</Text>
      </Button>
    </Screen>
  )
}
