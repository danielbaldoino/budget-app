import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { BanknoteIcon, BoxIcon } from 'lucide-react-native'
import { View } from 'react-native'
import type { Cart } from '../_lib/types'

export function CartCard({ cart }: { cart: Cart }) {
  const { name, currencyCode, createdAt, cartItems } = cart

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const createdAtLabel = i18n.t('common.labels.createdAt', {
    date: new Date(createdAt).toLocaleDateString(),
  })

  return (
    <Card className="rounded-lg">
      <CardHeader className="text-muted-foreground">
        <CardTitle variant="large">{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <View className="flex-row items-center gap-x-2">
          <Badge variant="outline" className="border-border">
            <Icon
              className="text-foreground"
              size={ICON_SIZES.smaller}
              as={BanknoteIcon}
            />
            <Text className="font-light">{currencyCode}</Text>
          </Badge>

          <Badge variant="outline" className="border-border">
            <Icon
              className="text-foreground"
              size={ICON_SIZES.smaller}
              as={BoxIcon}
            />
            <Text className="font-light">
              {i18n.t('common.labels.items', { count: itemCount })}
            </Text>
          </Badge>
        </View>
      </CardContent>

      <CardFooter className="justify-end">
        <Text className="text-right font-light text-muted-foreground text-xs">
          {createdAtLabel}
        </Text>
      </CardFooter>
    </Card>
  )
}
