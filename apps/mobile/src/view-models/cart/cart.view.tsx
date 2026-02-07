import { BottomBar } from '@/components/bottom-bar'
import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { QuantitySelector } from '@/components/quantity-selector'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import {
  CheckIcon,
  ListIcon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
} from 'lucide-react-native'
import { useState } from 'react'
import {
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { Share } from 'react-native'
import { useCartViewModel } from './cart.view-model'

export function CartView() {
  const { isLoading, cart, redirectToCarts } = useCartViewModel()
  const [count, setCount] = useState(0)

  const hasGlass = isLiquidGlassAvailable()

  return (
    <Screen
      options={{
        title: i18n.t('cart.title'),
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
      className="android:mb-safe-offset-20"
      loading={isLoading}
      empty={!cart ? i18n.t('cart.states.noCartFound') : undefined}
    >
      {Platform.select({
        ios: null,
        default: (
          <View className="rounded-b-lg bg-card p-4">
            <ScrollView horizontal contentContainerClassName="gap-x-4">
              <Button variant="outline" onPress={redirectToCarts}>
                <Icon size={ICON_SIZES.small} as={ListIcon} />
                <Text>{i18n.t('cart.actions.viewAllCarts')}</Text>
              </Button>

              <Button variant="outline" disabled={isLoading}>
                <Icon size={ICON_SIZES.small} as={PlusIcon} />
                <Text>{i18n.t('cart.actions.newCart')}</Text>
              </Button>
            </ScrollView>
          </View>
        ),
      })}

      <FlatList
        contentContainerClassName={cn(
          'gap-y-2 p-4',
          hasGlass && 'pb-safe-offset-24',
        )}
        data={cart?.cartItems ?? []}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <Payload payload={{ item }} />}
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('cart.states.noItems')}
          </Text>
        )}
      />

      <BottomBar
        containerClassName={cn(
          hasGlass && 'absolute bottom-0 mx-4 mb-safe-offset-16',
        )}
        className={cn(
          'h-24 flex-row items-center justify-between gap-4 p-4',
          !hasGlass && 'rounded-t-lg bg-primary/5',
        )}
      >
        <QuantitySelector
          className="h-full flex-1 border-muted-foreground/50 "
          quantity={count}
          onQuantityChange={setCount}
        />

        <Button
          className="h-full flex-1"
          onPress={() => {}}
          disabled={(cart?.cartItems.length ?? 0) === 0}
        >
          <Icon
            className="text-primary-foreground"
            size={ICON_SIZES.small}
            as={CheckIcon}
          />
          <Text>{i18n.t('cart.actions.checkout')}</Text>
        </Button>
      </BottomBar>
    </Screen>
  )
}
