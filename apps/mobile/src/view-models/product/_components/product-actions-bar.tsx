import { BottomBar } from '@/components/bottom-bar'
import { QuantitySelector } from '@/components/quantity-selector'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { ShoppingCartIcon } from 'lucide-react-native'
import { useProductContext } from '../product.context'

export function ProductActionsBar() {
  const {
    canAddToCart,
    variant,
    stockQuantity,
    quantity,
    setQuantity,
    handleAddToCart,
  } = useProductContext()
  const hasGlass = isLiquidGlassAvailable()

  return (
    <BottomBar
      containerClassName={cn('mb-safe', hasGlass && 'absolute bottom-0 mx-4')}
      className={cn(
        'h-24 flex-row items-center justify-between gap-x-4 p-4',
        !hasGlass && 'rounded-t-lg bg-primary/5',
      )}
    >
      <QuantitySelector
        className="h-full flex-1 border-muted-foreground/50"
        quantity={quantity}
        onQuantityChange={setQuantity}
        max={variant?.manageInventory ? (stockQuantity ?? 0) : undefined}
      />

      <Button
        className="min-h-16 flex-1"
        onPress={handleAddToCart}
        disabled={!canAddToCart}
      >
        <Icon className="text-primary-foreground" as={ShoppingCartIcon} />
        <Text>{i18n.t('product.actions.addToCart')}</Text>
      </Button>
    </BottomBar>
  )
}
