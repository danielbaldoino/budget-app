import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductPriceCard() {
  const { variant, price, toLongPrice, handlePriceCardPress } =
    useProductContext()

  return (
    <Pressable
      className="disabled:opacity-25"
      onPress={handlePriceCardPress}
      disabled={!variant}
    >
      <View className="gap-y-1">
        <Text variant="h3" className="text-right font-bold">
          {toLongPrice(price?.amount) ||
            i18n.t('product.price.fallback.noPrice')}
        </Text>

        <View className="flex-row items-center justify-end gap-x-1">
          <Text
            variant="small"
            className="text-right font-light text-muted-foreground"
          >
            {i18n.t('common.actions.viewAll')}
          </Text>

          <Icon className="text-muted-foreground" as={ChevronRightIcon} />
        </View>
      </View>
    </Pressable>
  )
}
