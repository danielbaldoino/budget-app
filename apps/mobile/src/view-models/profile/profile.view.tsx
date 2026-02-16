import { Screen } from '@/components/layout/screen'
import { ThemeIcon } from '@/components/theme-icon'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import {
  LogOutIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  UserIcon,
} from 'lucide-react-native'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { useProfileViewModel } from './profile.view-model'

export function ProfileView() {
  const {
    isLoading,
    user,
    handleSignOut,
    handleSetSystemTheme,
    handleToggleTheme,
  } = useProfileViewModel()

  return (
    <Screen
      options={{
        title: i18n.t('profile.title'),
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon
              as={Platform.select({
                ios: MoreHorizontalIcon,
                default: MoreVerticalIcon,
              })}
            />
          </TouchableOpacity>
        ),
      }}
      className="android:mb-safe-offset-20"
    >
      <ScrollView contentContainerClassName="gap-y-4 p-4">
        <View className="rounded-lg bg-muted p-4">
          {isLoading ? (
            <ActivityIndicator className="py-8 text-primary" size="large" />
          ) : !user ? (
            <Text className="py-8 text-center text-destructive">
              {i18n.t('profile.errors.loading')}
            </Text>
          ) : (
            <>
              <View className="flex-row items-center gap-x-2">
                <Icon as={UserIcon} />
                <Text variant="large">
                  {user?.name || i18n.t('common.fallback.noName')}
                </Text>
              </View>

              <Text variant="p" className="text-muted-foreground text-sm">
                {i18n.t('profile.description')}
              </Text>
            </>
          )}
        </View>

        <Button
          variant="outline"
          onPress={handleToggleTheme}
          onLongPress={handleSetSystemTheme}
        >
          <ThemeIcon />
          <Text>{i18n.t('profile.actions.toggleTheme')}</Text>
        </Button>

        <Button variant="outline" onPress={handleSignOut}>
          <Icon className="text-destructive" as={LogOutIcon} />
          <Text className="text-destructive">
            {i18n.t('profile.actions.signOut')}
          </Text>
        </Button>
      </ScrollView>
    </Screen>
  )
}
