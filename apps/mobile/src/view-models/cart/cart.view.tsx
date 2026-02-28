import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import {
  ListIcon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
} from 'lucide-react-native'
import {
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { CartBottomBar } from './_components/cart-bottom-bar'
import { CartItemCard } from './_components/cart-item-card'
import { CartSummaryCard } from './_components/cart-summary-card'
import { CartProvider, useCartContext } from './cart.context'

export function CartView() {
  return (
    <CartProvider>
      <CartContent />
    </CartProvider>
  )
}

function CartContent() {
  const {
    isLoading,
    cart,
    handleGoToCarts,
    handleGoToCreateCart,
    handleGoToEditCart,
    handleShare,
  } = useCartContext()
  const { toLongPrice } = useCurrencyCode({ currencyCode: cart?.currencyCode })

  const hasGlass = isLiquidGlassAvailable()

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
              <Text>{i18n.t('common.actions.viewAll')}</Text>
            </TouchableOpacity>
          ),
        }),
        headerRight: () => {
          const disabled = isLoading || !cart

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
                <Text>{i18n.t('common.actions.viewAll')}</Text>
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
        renderItem={({ item }) => {
          const totalPrice = toLongPrice(
            (item.productVariant.priceSets[0]?.prices[0]?.amount || 0) *
              item.quantity,
          )

          return <CartItemCard cartItem={item} totalPrice={totalPrice} />
        }}
        ListHeaderComponent={() =>
          cart && (
            <View className="gap-y-4">
              <CartSummaryCard />
              <Separator className="w-11/12 self-center" />
            </View>
          )
        }
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('cart.states.noItems')}
          </Text>
        )}
      />

      <CartBottomBar />
    </Screen>
  )
}
