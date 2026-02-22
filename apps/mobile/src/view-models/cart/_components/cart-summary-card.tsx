import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { BanknoteIcon, TagIcon } from 'lucide-react-native'
import { ScrollView } from 'react-native'
import { useCartContext } from '../cart.context'

export function CartSummaryCard() {
  const { cart } = useCartContext()

  if (!cart) {
    return null
  }

  return (
    <Card className="rounded-lg">
      <CardHeader className="text-muted-foreground">
        <CardTitle variant="large">{cart.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollView horizontal contentContainerClassName="gap-x-2">
          <Badge variant="outline" className="border-border">
            <Icon
              className="text-foreground"
              size={ICON_SIZES.smaller}
              as={BanknoteIcon}
            />
            <Text className="font-light">{cart.currencyCode}</Text>
          </Badge>

          {cart.priceList && (
            <Badge variant="outline" className="border-border">
              <Icon
                className="text-foreground"
                size={ICON_SIZES.smaller}
                as={TagIcon}
              />
              <Text className="font-light">{cart.priceList.name}</Text>
            </Badge>
          )}
        </ScrollView>
      </CardContent>
    </Card>
  )
}
