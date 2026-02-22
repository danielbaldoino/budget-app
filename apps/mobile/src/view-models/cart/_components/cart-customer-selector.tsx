import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { ChevronDownIcon, UserCircleIcon } from 'lucide-react-native'
import { TouchableOpacity, View } from 'react-native'
import { useCartContext } from '../cart.context'

export function CartCustomerSelector() {
  const { cart, handleGoToSelectCustomer } = useCartContext()

  if (!cart) {
    return null
  }

  return (
    <TouchableOpacity
      className="flex-row items-center gap-x-4 rounded-lg border border-border bg-muted p-4"
      onPress={handleGoToSelectCustomer}
    >
      <Icon className="text-muted-foreground" as={UserCircleIcon} />

      <View className="flex-1">
        {cart.customer && <Text variant="large">{cart.customer.name}</Text>}

        <Text variant="p" className="text-muted-foreground text-xs">
          {cart.customer?.id ?? i18n.t('cart.fallback.noContact')}
        </Text>
      </View>

      <Icon className="text-muted-foreground" as={ChevronDownIcon} />
    </TouchableOpacity>
  )
}
