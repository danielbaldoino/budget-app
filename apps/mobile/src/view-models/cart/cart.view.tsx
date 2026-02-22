import { BottomBar } from '@/components/bottom-bar'
import { Screen } from '@/components/layout/screen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { router } from 'expo-router'
import {
  BanknoteIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CirclePercentIcon,
  ListIcon,
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
import { CartItemCard } from './_componets/cart-item-card'
import { useCartViewModel } from './cart.view-model'

export function CartView() {
  const {
    isLoading,
    cart,
    handleGoToCarts,
    handleGoToCreateCart,
    handleGoToEditCart,
    handleGoToCheckout,
    handleGoToSelectCustomer,
    handleShare,
  } = useCartViewModel()
  const { toLongPrice } = useCurrencyCode({ currencyCode: cart?.currencyCode })

  const hasGlass = isLiquidGlassAvailable()
  const hasActiveCart = Boolean(cart)
  const canCheckout = hasActiveCart && (cart?.cartItems.length ?? 0) > 0

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
              <Card className="rounded-lg">
                <CardHeader className="text-muted-foreground">
                  <CardTitle variant="large">{cart.name}</CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollView horizontal contentContainerClassName="gap-x-2">
                    <Badge variant="outline" className="border-border">
                      <Icon
                        className="text-foreground"
                        size={ICON_SIZES.smaller}
                        as={BanknoteIcon}
                      />
                      <Text className="font-light">{cart.currencyCode}</Text>
                    </Badge>

                    {cart.priceList && (
                      <Badge variant="outline" className="border-border">
                        <Icon
                          className="text-foreground"
                          size={ICON_SIZES.smaller}
                          as={TagIcon}
                        />
                        <Text className="font-light">
                          {cart.priceList.name}
                        </Text>
                      </Badge>
                    )}
                  </ScrollView>
                </CardContent>
              </Card>

              <TouchableOpacity
                className="flex-row items-center gap-x-4 rounded-lg border border-border bg-muted p-4"
                onPress={handleGoToSelectCustomer}
              >
                <Icon className="text-muted-foreground" as={UserCircleIcon} />

                <View className="flex-1">
                  {cart.customer && (
                    <Text variant="large">{cart.customer.name}</Text>
                  )}

                  <Text variant="p" className="text-muted-foreground text-xs">
                    {cart.customer?.id ?? i18n.t('cart.fallback.noContact')}
                  </Text>
                </View>

                <Icon className="text-muted-foreground" as={ChevronDownIcon} />
              </TouchableOpacity>

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
        className={cn('gap-y-4 p-4', !hasGlass && 'rounded-t-lg bg-primary/5')}
      >
        <View className="w-full flex-row items-center justify-between gap-x-4">
          <Text className="font-semibold">
            {i18n.t('common.labels.subtotal')}:
          </Text>
          <Text className="text-right font-semibold text-primary">
            {toLongPrice(
              cart?.cartItems.reduce((acc, item) => {
                const itemTotal =
                  (item.productVariant.priceSets[0]?.prices[0]?.amount || 0) *
                  item.quantity
                return acc + itemTotal
              }, 0),
            ) ?? i18n.t('common.fallback.notAvailable')}
          </Text>
        </View>

        <Separator className="bg-muted" />

        <View className="flex-row items-center justify-between gap-x-4">
          <Button
            variant="outline"
            className="min-h-14 flex-1"
            onPress={() => router.push('price-adjustments')}
            disabled={isLoading || !hasActiveCart}
          >
            <Icon as={CirclePercentIcon} />
            <Text>{i18n.t('common.actions.adjustments')}</Text>
          </Button>

          <Button
            className="min-h-14 flex-1"
            onPress={handleGoToCheckout}
            disabled={!canCheckout}
          >
            <Icon className="text-primary-foreground" as={CheckCircle2Icon} />
            <Text>{i18n.t('cart.actions.checkout')}</Text>
          </Button>
        </View>
      </BottomBar>
    </Screen>
  )
}
