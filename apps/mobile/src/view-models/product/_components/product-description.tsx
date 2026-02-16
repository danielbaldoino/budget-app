import { Text } from '@/components/ui/text'
import { View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductDescription() {
  const { product } = useProductContext()

  return (
    <View className="gap-y-4 rounded-lg bg-muted p-4">
      {product?.subtitle && (
        <Text variant="h4" className="font-bold">
          {product.subtitle}
        </Text>
      )}

      <Text variant="p" className="text-muted-foreground">
        {product?.description || 'Sem descrição'}
      </Text>
    </View>
  )
}
