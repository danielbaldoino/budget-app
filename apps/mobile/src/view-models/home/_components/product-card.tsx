import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { type Href, Link } from 'expo-router'
import { ChevronRightIcon, ImageOffIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, Share, View } from 'react-native'
import type { Product } from '../_lib/types'

export function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false)

  const { id, name, description } = product
  const imageUrl = product.images[0]?.url

  return (
    <LinkWrapper href={{ pathname: 'products/[id]', params: { id } }}>
      <View className="flex-row items-center gap-x-4 rounded-lg border border-border/20 bg-card p-2">
        <View className="size-16 overflow-hidden rounded-sm bg-muted">
          {Boolean(imageUrl) && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              className="size-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Icon className="m-auto text-muted-foreground" as={ImageOffIcon} />
          )}
        </View>
        <View className="flex-1">
          <Text variant="large">{name}</Text>
          <Text variant="p" className="text-muted-foreground">
            {description}
          </Text>
        </View>
        <Icon className="text-muted-foreground" as={ChevronRightIcon} />
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
