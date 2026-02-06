import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { APP_CONSTANTS } from '@/constants/app'
import { ICON_SIZES } from '@/constants/theme'
import { ChevronRightIcon } from 'lucide-react-native'
import { useWelcomeViewModel } from './welcome.view-model'

export function WelcomeView() {
  const { handleGoToSignIn } = useWelcomeViewModel()

  return (
    <Screen
      safeAreaEdges={{ bottom: true }}
      contentClassName="flex-1 justify-end gap-8 p-8"
      scrollEnabled={false}
    >
      <Text className="text-left" variant="h1">
        {APP_CONSTANTS.NAME}
      </Text>

      <Text className="text-left">
        Bem-vindo ao aplicativo de orçamento! Faça seus orçamentos de produtos
        de forma fácil e rápida.
      </Text>

      <Button onPress={handleGoToSignIn}>
        <Text>Continuar</Text>
        <Icon
          className="text-primary-foreground"
          size={ICON_SIZES.small}
          as={ChevronRightIcon}
        />
      </Button>
    </Screen>
  )
}
