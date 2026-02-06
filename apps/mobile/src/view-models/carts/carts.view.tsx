import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { PlusIcon, XIcon } from 'lucide-react-native'
import { Platform, TouchableOpacity } from 'react-native'

export function CartsView() {
  return (
    <Screen
      options={{
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={router.back}
            >
              <Icon size={ICON_SIZES.small} as={XIcon} />
            </TouchableOpacity>
          ),
        }),
        headerRight: () =>
          Platform.select({
            ios: (
              <TouchableOpacity className="p-2">
                <Icon size={ICON_SIZES.small} as={PlusIcon} />
              </TouchableOpacity>
            ),
            default: (
              <Button variant="outline">
                <Icon size={ICON_SIZES.small} as={PlusIcon} />
                <Text>{i18n.t('carts.actions.newCart')}</Text>
              </Button>
            ),
          }),
      }}
    />
  )
}
