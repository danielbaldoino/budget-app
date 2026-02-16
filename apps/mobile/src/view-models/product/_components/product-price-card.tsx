import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductPriceCard() {
  const { product, variant, price, toLongPrice } = useProductContext()

  const handlePress = () =>
    router.push({
      pathname: 'products/[productId]/variants/[variantId]/pricing',
      params: { productId: product?.id, variantId: variant?.id },
    })

  return (
    <Pressable onPress={handlePress} disabled={!variant}>
      <View className="gap-y-1">
        <Text variant="h3" className="text-right font-bold">
          {toLongPrice(price?.amount) || 'Sem preço'}
        </Text>

        <View
          className={cn(
            'flex-row items-center justify-end gap-x-1',
            !variant && 'opacity-25',
          )}
        >
          <Text
            variant="small"
            className="text-right font-light text-muted-foreground"
          >
            Ver todos
          </Text>

          <Icon className="text-muted-foreground" as={ChevronRightIcon} />
        </View>
      </View>
    </Pressable>
  )
}
