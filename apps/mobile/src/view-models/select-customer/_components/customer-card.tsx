import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ChevronRightIcon, ImageOffIcon } from 'lucide-react-native'
import { TouchableOpacity, View } from 'react-native'
import type { Customer } from '../_lib/types'

export function CustomerCard({
  customer,
  onPress,
}: {
  customer: Customer
  onPress: () => void
}) {
  const { name, email } = customer

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex-row items-center gap-x-4 bg-card px-4 py-2">
        <View className="size-16 overflow-hidden rounded-sm bg-muted">
          <Icon className="m-auto text-muted-foreground" as={ImageOffIcon} />
        </View>
        <View className="flex-1">
          <Text variant="large">{name}</Text>
          <Text variant="p" className="text-muted-foreground">
            {email}
          </Text>
        </View>
        <Icon className="text-muted-foreground" as={ChevronRightIcon} />
      </View>
    </TouchableOpacity>
  )
}
