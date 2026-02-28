import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import {
  BanknoteIcon,
  ChevronRightIcon,
  ContactIcon,
  TagIcon,
} from 'lucide-react-native'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useCartContext } from '../cart.context'

export function CartSummaryCard() {
  const { cart, handleGoToSelectCustomer } = useCartContext()

  if (!cart) {
    return null
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="text-muted-foreground">
        <Text>{cart.name}</Text>
        <ScrollView horizontal contentContainerClassName="gap-x-2">
          <Badge variant="outline" className="border-border">
            <Icon
              className="text-foreground"
              size={ICON_SIZES.smaller}
              as={BanknoteIcon}
            />
            <Text className="font-light">{cart.currencyCode}</Text>
          </Badge>

          <Badge variant="outline" className="border-border">
            <Icon
              className="text-foreground"
              size={ICON_SIZES.smaller}
              as={TagIcon}
            />
            <Text className="font-light">
              {cart.priceList?.name || 'Padrão'}
            </Text>
          </Badge>
        </ScrollView>
      </CardHeader>

      <Separator className="w-11/12 self-center" />

      <CardContent>
        <TouchableOpacity
          className="flex-row items-center gap-x-4"
          onPress={handleGoToSelectCustomer}
        >
          <View className="rounded-lg bg-muted p-2">
            <Icon className="text-muted-foreground" as={ContactIcon} />
          </View>

          <View className="flex-1">
            {cart.customer && <Text>{cart.customer.name}</Text>}

            <Text variant="p" className="text-muted-foreground text-xs">
              {cart.customer?.referenceId ?? i18n.t('cart.fallback.noContact')}
            </Text>
          </View>

          <Icon className="text-muted-foreground" as={ChevronRightIcon} />
        </TouchableOpacity>
      </CardContent>
    </Card>
  )
}
