import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import {
  ListIcon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
} from 'lucide-react-native'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { Share } from 'react-native'
import { useCartViewModel } from './cart.view-model'

export function CartView() {
  const { isLoading, cart, redirectToCarts } = useCartViewModel()

  return (
    <Screen
      options={{
        headerLeft: Platform.select({
          ios: () => (
            <TouchableOpacity
              className="flex-row gap-2 p-2"
              onPress={redirectToCarts}
            >
              <Icon size={ICON_SIZES.small} as={ListIcon} />
              <Text>{i18n.t('cart.actions.viewAllCarts')}</Text>
            </TouchableOpacity>
          ),
        }),
        headerRight: () => {
          const disabled = isLoading || !cart

          return (
            <View className="flex-row gap-2 ios:gap-4">
              <TouchableOpacity className="p-2" disabled={disabled}>
                <Icon
                  className={cn(disabled && 'text-muted-foreground/50')}
                  size={ICON_SIZES.small}
                  as={SettingsIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="p-2"
                disabled={disabled}
                onPress={() =>
                  Share.share({
                    title: i18n.t('cart.actions.shareCart'),
                    message: '/',
                  })
                }
              >
                <Icon
                  className={cn(disabled && 'text-muted-foreground/50')}
                  size={ICON_SIZES.small}
                  as={ShareIcon}
                />
              </TouchableOpacity>
            </View>
          )
        },
      }}
      contentClassName="pt-0 lg:p-0"
      isPending={isLoading}
      androidBottomTabInset
    >
      {Platform.select({
        ios: null,
        default: (
          <ScrollView
            horizontal
            className="-mx-4 rounded-b-lg bg-card p-4 pt-0"
          >
            <Button
              variant="outline"
              className="me-4 w-fit"
              onPress={redirectToCarts}
            >
              <Icon size={ICON_SIZES.small} as={ListIcon} />

              <Text>{i18n.t('cart.actions.viewAllCarts')}</Text>
            </Button>

            <Button
              variant="outline"
              className="me-4 w-fit"
              disabled={isLoading}
            >
              <Icon size={ICON_SIZES.small} as={PlusIcon} />
              <Text>{i18n.t('cart.actions.newCart')}</Text>
            </Button>
          </ScrollView>
        ),
      })}

      {!cart ? (
        <Text className="px-16 py-8 text-center text-muted-foreground">
          {i18n.t('cart.states.noCartFound')}
        </Text>
      ) : (
        <Payload payload={{ cart }} />
      )}
    </Screen>
  )
}
