import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { APP_CONSTANTS } from '@/constants/app'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { ChevronRightIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { useWelcomeViewModel } from './welcome.view-model'

export function WelcomeView() {
  const { handleGoToSignIn } = useWelcomeViewModel()

  return (
    <Screen className="android:pb-safe-offset-8">
      <View className="mt-auto gap-y-8 p-8 ">
        <Text className="text-left" variant="h1">
          {APP_CONSTANTS.NAME}
        </Text>

        <Text className="text-left">{i18n.t('welcome.description')}</Text>

        <Button onPress={handleGoToSignIn}>
          <Text>{i18n.t('welcome.actions.getStarted')}</Text>
          <Icon
            className="text-primary-foreground"
            size={ICON_SIZES.small}
            as={ChevronRightIcon}
          />
        </Button>
      </View>
    </Screen>
  )
}
