import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import {
  LogOutIcon,
  MoonIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react-native'
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native'
import { useProfileViewModel } from './profile.view-model'

export function ProfileView() {
  const { isLoading, user, signOut, toggleTheme } = useProfileViewModel()
  const { isDarkMode, colors } = useAppearance()

  return (
    <Screen
      options={{
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon
              size={ICON_SIZES.small}
              as={Platform.select({
                ios: MoreHorizontalIcon,
                default: MoreVerticalIcon,
              })}
            />
          </TouchableOpacity>
        ),
      }}
      androidBottomTabInset
    >
      <View className="rounded-lg bg-muted p-4">
        {isLoading ? (
          <ActivityIndicator
            className="py-8"
            size="large"
            color={colors.primary}
          />
        ) : !user ? (
          <Text className="py-8 text-center text-destructive">
            Não foi possível carregar os produtos.
          </Text>
        ) : (
          <>
            <View className="flex-row items-center gap-x-2">
              <Icon as={UserIcon} size={ICON_SIZES.small} />
              <Text variant="large">{user?.name || 'Usuário'}</Text>
            </View>
            <Text variant="p" className="text-muted-foreground text-sm sm:mt-3">
              Este é o seu perfil. Aqui você pode gerenciar suas informações,
              preferências e configurações do aplicativo.
            </Text>
          </>
        )}
      </View>

      <Button variant="outline" onPress={toggleTheme}>
        <Icon size={ICON_SIZES.small} as={isDarkMode ? SunIcon : MoonIcon} />
        <Text>Alternar Tema</Text>
      </Button>

      <Button variant="outline" onPress={signOut}>
        <Icon
          className="text-destructive"
          size={ICON_SIZES.small}
          as={LogOutIcon}
        />
        <Text className="text-destructive">Sair</Text>
      </Button>
    </Screen>
  )
}
