import { Text } from '@/components/ui/text'
import { View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductCategory() {
  const { product } = useProductContext()

  return (
    <View className="flex-1 gap-y-1">
      <Text variant="small" className="font-light text-muted-foreground">
        Categoria
      </Text>

      <Text variant="h4">{product?.category?.name || 'Sem categoria'}</Text>
    </View>
  )
}
