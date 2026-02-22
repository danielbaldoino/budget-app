import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductVariantInfo() {
  const { variant, handleCopySku } = useProductContext()

  if (!variant) {
    return null
  }

  return (
    <View className="gap-y-1">
      <Text variant="h1" className="text-left font-bold">
        {variant.name}
      </Text>

      <Pressable onLongPress={handleCopySku}>
        <Text variant="muted" className="font-medium font-mono">
          {variant.sku || i18n.t('common.fallback.noSku')}
        </Text>
      </Pressable>
    </View>
  )
}
