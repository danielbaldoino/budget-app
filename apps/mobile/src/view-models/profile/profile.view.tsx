import { Screen } from '@/components/layout/screen'
import { ThemeIcon } from '@/components/theme-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { LogOutIcon, UserIcon } from 'lucide-react-native'
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
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
          <TouchableOpacity
            className="flex-row gap-x-2 p-2"
            onPress={handleSignOut}
          >
            <Text>{i18n.t('profile.actions.signOut')}</Text>
            <Icon as={LogOutIcon} />
          </TouchableOpacity>
        ),
      }}
      className="android:mb-safe-offset-20"
    >
      <ScrollView contentContainerClassName="gap-y-4 p-4">
        <Card className="rounded-lg">
          {isLoading ? (
            <ActivityIndicator className="py-8 text-primary" size="large" />
          ) : !user ? (
            <Text className="py-8 text-center text-destructive">
              {i18n.t('profile.errors.loading')}
            </Text>
          ) : (
            <>
              <CardHeader className="flex-row items-center gap-x-2">
                <Icon as={UserIcon} />
                <CardTitle variant="large">
                  {user.name || i18n.t('common.fallback.noName')}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Text variant="p" className="text-muted-foreground text-sm">
                  {i18n.t('profile.description')}
                </Text>
              </CardContent>
            </>
          )}
        </Card>

        <Text variant="h4" className="text-muted-foreground">
          Appearance
        </Text>

        <Button
          variant="outline"
          onPress={handleToggleTheme}
          onLongPress={handleSetSystemTheme}
        >
          <ThemeIcon />
          <Text>{i18n.t('profile.actions.toggleTheme')}</Text>
        </Button>
      </ScrollView>
    </Screen>
  )
}
