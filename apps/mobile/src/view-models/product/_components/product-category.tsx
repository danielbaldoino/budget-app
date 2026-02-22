import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductCategory() {
  const { product } = useProductContext()

  return (
    <View className="flex-1 gap-y-1">
      <Text variant="small" className="font-light text-muted-foreground">
        {i18n.t('product.labels.category')}
      </Text>

      <Text variant="h4">
        {product?.category?.name || i18n.t('common.fallback.noCategory')}
      </Text>
    </View>
  )
}
