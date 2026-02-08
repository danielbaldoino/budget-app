import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { type Href, Link } from 'expo-router'
import { ChevronRightIcon, ImageOffIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, View } from 'react-native'
import type { Product } from '../_lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false)

  const { id, name, description } = product
  const imageUrl = product.images[0]?.url

  return (
    <LinkWrapper href={{ pathname: 'products/[id]', params: { id } }}>
      <View className="flex-row items-center gap-x-4 bg-card px-4 py-2">
        <View className="size-16 overflow-hidden rounded-sm bg-muted">
          {Boolean(imageUrl) && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              className="size-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon
              className="m-auto text-muted-foreground"
              as={ImageOffIcon}
              size={ICON_SIZES.small}
            />
          )}
        </View>
        <View className="flex-1">
          <Text variant="large">{name}</Text>
          <Text variant="p" className="text-muted-foreground">
            {description}
          </Text>
        </View>
        <Icon
          className="text-muted-foreground"
          as={ChevronRightIcon}
          size={ICON_SIZES.small}
        />
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
  return (
    <View>
      {Platform.select({
        ios: (
          <Link href={href}>
            <Link.Trigger>{children}</Link.Trigger>
            <Link.Preview />
          </Link>
        ),
        default: (
          <Link href={href} asChild>
            <Pressable>{children}</Pressable>
          </Link>
        ),
      })}
    </View>
  )
}
