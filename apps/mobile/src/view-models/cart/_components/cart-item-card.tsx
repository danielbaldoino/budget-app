import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { type Href, Link } from 'expo-router'
import {
  BoxIcon,
  Edit2Icon,
  ImageOffIcon,
  ShoppingBagIcon,
  TrashIcon,
} from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, View } from 'react-native'
import type { CartItem } from '../_lib/types'
import { useCartContext } from '../cart.context'

type Props = {
  cartItem: CartItem
  totalPrice?: string
}

export function CartItemCard({ cartItem, totalPrice }: Props) {
  const { handleDeleteCartItem } = useCartContext()

  const [imageError, setImageError] = useState(false)

  const { id, productVariant } = cartItem
  const {
    id: variantId,
    productId,
    name,
    sku,
    thumbnail: imageUrl,
  } = productVariant

  const handleDeleteItem = () => handleDeleteCartItem(id)

  return (
    <LinkWrapper
      href={{
        pathname: 'products/[id]',
        params: { id: productId, variantId, mode: 'cart' },
      }}
      onDeleteCartItem={handleDeleteItem}
    >
      <View className="flex-row items-center gap-x-4 rounded-lg border border-border/25 bg-card p-2">
        <View className="size-16 overflow-hidden rounded-sm bg-muted">
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              className="size-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon className="m-auto text-muted-foreground" as={ImageOffIcon} />
          )}
        </View>

        <View className="flex-1 gap-y-2">
          <Text variant="large">{name}</Text>

          <Text variant="muted" className="font-medium font-mono">
            {sku}
          </Text>

          <View className="flex-row items-center gap-x-1">
            <Icon
              className="text-muted-foreground"
              as={BoxIcon}
              size={ICON_SIZES.smallest}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              {i18n.t('common.labels.quantity')}:
            </Text>
            <Text variant="small" className="font-light">
              {cartItem.quantity}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-1.5">
            <Icon
              className="text-muted-foreground"
              as={ShoppingBagIcon}
              size={ICON_SIZES.smallest}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              {i18n.t('common.labels.totalPrice')}:
            </Text>
            <Text variant="small" className="font-light">
              {totalPrice}
            </Text>
          </View>
        </View>

        <View className="gap-y-2">
          <View className="rounded-md bg-muted p-2">
            <Icon className="text-primary" as={Edit2Icon} />
          </View>

          {Platform.select({
            native: (
              <Pressable
                onPress={handleDeleteItem}
                className="rounded-md bg-muted p-2"
              >
                <Icon className="text-destructive" as={TrashIcon} />
              </Pressable>
            ),
          })}
        </View>
      </View>
    </LinkWrapper>
  )
}

function LinkWrapper({
  children,
  href,
  onDeleteCartItem,
}: {
  children: React.ReactNode
  href: Href
  onDeleteCartItem: () => void
}) {
  return (
    <View>
      {Platform.select({
        ios: (
          <Link href={href}>
            <Link.Trigger>{children}</Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={i18n.t('common.actions.remove')}
                icon="trash"
                onPress={onDeleteCartItem}
                destructive={true}
              />
            </Link.Menu>
          </Link>
        ),
        default: (
          <Link href={href} asChild>
            <Pressable onLongPress={onDeleteCartItem}>{children}</Pressable>
          </Link>
        ),
      })}
    </View>
  )
}
