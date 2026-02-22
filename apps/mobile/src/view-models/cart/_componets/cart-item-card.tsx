import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { type Href, Link } from 'expo-router'
import { BoxIcon, Edit2Icon, ImageOffIcon, TagIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, Share, View } from 'react-native'
import type { CartItem } from '../_lib/types'

export function CartItemCard({
  cartItem,
  totalPrice,
}: { cartItem: CartItem; totalPrice?: string }) {
  const [imageError, setImageError] = useState(false)

  const { productVariant } = cartItem
  const {
    id: variantId,
    productId,
    name,
    sku,
    thumbnail: imageUrl,
  } = productVariant

  return (
    <LinkWrapper
      href={{
        pathname: 'products/[id]',
        params: { id: productId, variantId, mode: 'cart' },
      }}
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
              size={ICON_SIZES.smaller}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              Quantity:
            </Text>
            <Text variant="small" className="font-light">
              {cartItem.quantity}
            </Text>
          </View>

          <View className="flex-row items-center gap-x-1.5">
            <Icon
              className="text-muted-foreground"
              as={TagIcon}
              size={ICON_SIZES.smaller}
            />
            <Text variant="small" className="font-light text-muted-foreground">
              Total Price:
            </Text>
            <Text variant="small" className="font-light">
              {totalPrice}
            </Text>
          </View>
        </View>

        <View className="rounded-md bg-muted p-2">
          <Icon className="text-primary" as={Edit2Icon} />
        </View>
      </View>
    </LinkWrapper>
  )
}

function LinkWrapper({
  children,
  href,
}: {
  children: React.ReactNode
  href: Href
}) {
  const handleShare = () =>
    Share.share({ title: i18n.t('common.actions.share'), message: '' })

  return (
    <View>
      {Platform.select({
        ios: (
          <Link href={href}>
            <Link.Trigger>{children}</Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={i18n.t('common.actions.share')}
                icon="square.and.arrow.up"
                onPress={handleShare}
              />
            </Link.Menu>
          </Link>
        ),
        default: (
          <Link href={href} asChild>
            <Pressable onLongPress={handleShare}>{children}</Pressable>
          </Link>
        ),
      })}
    </View>
  )
}
