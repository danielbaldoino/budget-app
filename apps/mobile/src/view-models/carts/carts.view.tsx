import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { PlusIcon, XIcon } from 'lucide-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import { useCartsViewModel } from './carts.view-model'

export function CartsView() {
  const { handlerGoBack, handlerGoToCreateCart } = useCartsViewModel()

  return (
    <Screen
      options={{
        title: i18n.t('carts.title'),
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={handlerGoBack}
            >
              <Icon as={XIcon} />
            </TouchableOpacity>
          ),
        }),
        headerRight: () =>
          Platform.select({
            ios: (
              <TouchableOpacity className="p-2" onPress={handlerGoToCreateCart}>
                <Icon as={PlusIcon} />
              </TouchableOpacity>
            ),
            default: (
              <Button variant="outline" onPress={handlerGoToCreateCart}>
                <Icon as={PlusIcon} />
                <Text>{i18n.t('carts.actions.newCart')}</Text>
              </Button>
            ),
          }),
      }}
    />
  )
}
