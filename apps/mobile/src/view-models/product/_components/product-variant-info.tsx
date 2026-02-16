import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { setStringAsync } from 'expo-clipboard'
import { Alert, Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductVariantInfo() {
  const { variant } = useProductContext()

  if (!variant) {
    return null
  }

  const handleCopySKU = async () => {
    if (!variant.sku) {
      return
    }

    await setStringAsync(variant.sku)
    Alert.alert(variant.sku, i18n.t('common.messages.copiedToClipboard'))
  }

  return (
    <View className="gap-y-1">
      <Text variant="h1" className="text-left font-bold">
        {variant.name}
      </Text>

      <Pressable onLongPress={handleCopySKU}>
        <Text variant="muted" className="font-light">
          {variant.sku || 'Sem SKU'}
        </Text>
      </Pressable>
    </View>
  )
}
