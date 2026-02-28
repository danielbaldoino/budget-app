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
import { LinkIcon, MailIcon, PhoneIcon } from 'lucide-react-native'
import { View } from 'react-native'
import type { Customer } from '../_lib/types'

export function CustomerCard({
  customer: { referenceId, name, email, phone },
}: { customer: Customer }) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="text-muted-foreground">
        <CardTitle variant="large">{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <View className="gap-y-2">
          <View className="flex-row items-center gap-x-1">
            <Icon
              className="text-muted-foreground"
              as={MailIcon}
              size={ICON_SIZES.smaller}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              E-mail:
            </Text>
            <Text variant="small" className="font-light">
              {email ?? '--'}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-1">
            <Icon
              className="text-muted-foreground"
              as={PhoneIcon}
              size={ICON_SIZES.smaller}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              Telefone:
            </Text>
            <Text variant="small" className="font-light">
              {phone ?? '--'}
            </Text>
          </View>
        </View>
      </CardContent>

      <CardFooter className="justify-end">
        <CardFooter className="gap-x-2">
          <Icon
            className="text-muted-foreground"
            as={LinkIcon}
            size={ICON_SIZES.smaller}
          />
          <Text variant="small" className="font-light text-muted-foreground">
            {referenceId || '--'}
          </Text>
        </CardFooter>
      </CardFooter>
    </Card>
  )
}
