import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductPriceSettingsCard() {
  const { product, variant, price } = useProductContext()

  const handlePress = () =>
    router.push({
      pathname: 'price-adjustments',
      params: {
        productId: product?.id,
        variantId: variant?.id,
        basePrice: price?.amount,
      },
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
          Ajustes de preço
        </Text>

        <View className="flex-row items-center gap-x-1">
          <Text variant="small" className="font-light text-muted-foreground">
            Gerenciar
          </Text>
          <Icon className="text-muted-foreground" as={ChevronRightIcon} />
        </View>
      </View>

      <View className="items-end">
        <Text className="font-bold text-xl">-</Text>
        <Text variant="small" className="font-light text-muted-foreground">
          N/A
        </Text>
      </View>
    </Pressable>
  )
}
