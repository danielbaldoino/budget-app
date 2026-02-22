import { BottomBar } from '@/components/bottom-bar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { router } from 'expo-router'
import { CheckCircle2Icon, CirclePercentIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { useCartContext } from '../cart.context'

export function CartBottomBar() {
  const { isLoading, cart, handleGoToCheckout } = useCartContext()

  if (!cart) {
    return null
  }

  const { toLongPrice } = useCurrencyCode({ currencyCode: cart?.currencyCode })
  const hasGlass = isLiquidGlassAvailable()
  const canCheckout = cart && (cart?.cartItems.length ?? 0) > 0

  return (
    <BottomBar
      containerClassName={cn(
        hasGlass && 'absolute bottom-0 mx-4 mb-safe-offset-16',
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

      <Separator className="opacity-50" />

      <View className="flex-row items-center justify-between gap-x-4">
        <Button
          variant="outline"
          className="min-h-14 flex-1"
          onPress={() => router.push('price-adjustments')}
          disabled={isLoading || !cart}
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
  )
}
