import { BottomBar } from '@/components/bottom-bar'
import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useActiveCartId } from '@/hooks/use-active-cart'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import {
  BanknoteIcon,
  CheckIcon,
  ChevronDownIcon,
  ListIcon,
  OctagonXIcon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
  TagIcon,
  UserCircleIcon,
} from 'lucide-react-native'
import {
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCartViewModel } from './cart.view-model'

export function CartView() {
  const {
    isLoading,
    cart,
    handleGoToCarts,
    handleGoToCreateCart,
    handleGoToEditCart,
    handleGoToCheckout,
    handleShare,
  } = useCartViewModel()

  const hasGlass = isLiquidGlassAvailable()
  const hasActiveCart = Boolean(cart)
  const hasItems = (cart?.cartItems.length ?? 0) > 0

  const setActiveCartId = useActiveCartId()[1]

  return (
    <Screen
      options={{
        title: i18n.t('cart.title'),
        headerLeft: Platform.select({
          ios: () => (
            <TouchableOpacity
              className="flex-row gap-x-2 p-2"
              onPress={handleGoToCarts}
            >
              <Icon as={ListIcon} />
              <Text>{i18n.t('cart.actions.viewAllCarts')}</Text>
            </TouchableOpacity>
          ),
        }),
        headerRight: () => {
          const disabled = isLoading || !hasActiveCart

          return (
            <View className="flex-row gap-x-2 ios:gap-x-4">
              <TouchableOpacity
                className="p-2"
                onPress={handleGoToEditCart}
                disabled={disabled}
              >
                <Icon
                  className={cn(disabled && 'text-muted-foreground/50')}
                  as={SettingsIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="p-2"
                onPress={handleShare}
                disabled={disabled}
              >
                <Icon
                  className={cn(disabled && 'text-muted-foreground/50')}
                  as={ShareIcon}
                />
              </TouchableOpacity>
            </View>
          )
        },
      }}
      className="android:mb-safe-offset-20"
      loading={isLoading}
    >
      {Platform.select({
        ios: null,
        default: (
          <View className="rounded-b-lg bg-card p-4">
            <ScrollView horizontal contentContainerClassName="gap-x-4">
              <Button variant="outline" onPress={handleGoToCarts}>
                <Icon as={ListIcon} />
                <Text>{i18n.t('cart.actions.viewAllCarts')}</Text>
              </Button>

              <Button
                variant="outline"
                onPress={handleGoToCreateCart}
                disabled={isLoading}
              >
                <Icon as={PlusIcon} />
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
        ListHeaderComponent={() =>
          cart && (
            <View className="gap-y-4">
              <View className="gap-y-2 rounded-lg border border-border bg-muted p-4">
                <Text variant="large" className="text-muted-foreground">
                  Orç. do alvez 123
                </Text>

                <ScrollView horizontal contentContainerClassName="gap-x-2">
                  <Badge variant="outline">
                    <Icon
                      className="text-foreground"
                      size={ICON_SIZES.smaller}
                      as={BanknoteIcon}
                    />
                    <Text>{cart.currencyCode}</Text>
                  </Badge>

                  {cart.priceList && (
                    <Badge variant="outline">
                      <Icon
                        className="text-foreground"
                        size={ICON_SIZES.smaller}
                        as={TagIcon}
                      />
                      <Text>{cart.priceList.name}</Text>
                    </Badge>
                  )}
                </ScrollView>
              </View>

              <View className="flex-row items-center gap-x-4 rounded-lg border border-border bg-muted p-4">
                <Icon className="text-muted-foreground" as={UserCircleIcon} />

                <View className="flex-1">
                  {cart.customer && (
                    <Text variant="large">{cart.customer.name}</Text>
                  )}

                  <Text variant="p" className="text-muted-foreground text-xs">
                    {cart.customer ? '123.456.789-07' : 'Sem contato'}
                  </Text>
                </View>

                <Icon className="text-muted-foreground" as={ChevronDownIcon} />
              </View>

              <Separator />
            </View>
          )
        }
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('cart.states.noItems')}
          </Text>
        )}
      />

      <BottomBar
        containerClassName={cn(
          hasGlass && 'absolute bottom-0 mx-4 mb-safe-offset-16',
          !hasActiveCart && 'hidden',
        )}
        className={cn(
          'flex-row items-center justify-between gap-x-4 p-4',
          !hasGlass && 'rounded-t-lg bg-primary/5',
        )}
      >
        <Button
          variant="outline"
          className="min-h-12 flex-1"
          disabled={isLoading || !hasActiveCart}
          onPress={() => {
            setActiveCartId('')
          }}
        >
          <Icon className="text-foreground" as={OctagonXIcon} />
          <Text>Cancelar</Text>
        </Button>

        <Button
          className="min-h-12 flex-1"
          onPress={handleGoToCheckout}
          disabled={!hasItems}
        >
          <Icon className="text-primary-foreground" as={CheckIcon} />
          <Text>{i18n.t('cart.actions.checkout')}</Text>
        </Button>
      </BottomBar>
    </Screen>
  )
}
