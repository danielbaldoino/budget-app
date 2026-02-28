import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { ChevronRightIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductPriceSettingsCard() {
  const { variant, handlePriceSettingsPress } = useProductContext()

  return (
    <Pressable
      className="flex-row items-center justify-between rounded-lg bg-muted p-4 disabled:opacity-25"
      onPress={handlePriceSettingsPress}
      disabled={!variant}
    >
      <View className="gap-y-1">
        <Text variant="h4" className="font-bold">
          {i18n.t('product.priceSettings.title')}
        </Text>

        <View className="flex-row items-center gap-x-1">
          <Text variant="small" className="font-light text-muted-foreground">
            {i18n.t('common.actions.manage')}
          </Text>
          <Icon
            className="text-muted-foreground"
            size={ICON_SIZES.smaller}
            as={ChevronRightIcon}
          />
        </View>
      </View>

      <View className="items-end">
        <Text className="font-bold text-xl">-</Text>
        <Text variant="small" className="font-light text-muted-foreground">
          {i18n.t('common.fallback.notAvailable')}
        </Text>
      </View>
    </Pressable>
  )
}
