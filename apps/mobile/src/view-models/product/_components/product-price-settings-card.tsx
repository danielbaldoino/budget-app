import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
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
