import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductInventoryCard() {
  const { product, variant, stockQuantity } = useProductContext()

  const handlePress = () =>
    router.push({
      pathname: 'products/[productId]/variants/[variantId]/inventory',
      params: { productId: product?.id, variantId: variant?.id },
    })

  return (
    <Pressable
      className={cn(
        'flex-row items-center justify-between rounded-lg bg-muted p-4',
        !variant && 'opacity-25',
      )}
      onPress={handlePress}
      disabled={!variant}
    >
      <View className="gap-y-1">
        <Text variant="h4" className="font-bold">
          Estoque
        </Text>

        <View className="flex-row items-center gap-x-1">
          <Text variant="small" className="font-light text-muted-foreground">
            Ver inventário
          </Text>
          <Icon className="text-muted-foreground" as={ChevronRightIcon} />
        </View>
      </View>

      <View className="items-end">
        <Text className="font-bold text-xl">
          {variant?.manageInventory ? 'Habilitado' : 'Desabilitado'}
        </Text>
        <Text variant="small" className="font-light text-muted-foreground">
          {stockQuantity ?? 'N/A'}
        </Text>
      </View>
    </Pressable>
  )
}
