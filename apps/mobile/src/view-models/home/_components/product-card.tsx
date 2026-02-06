import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { Link } from 'expo-router'
import { ChevronRightIcon, TagIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, Share, View } from 'react-native'
import type { Product } from '../_lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const { id, name, description } = product
  const imageUrl = product.images[0]?.url

  const [imageError, setImageError] = useState(false)
  const showImage = !!imageUrl && !imageError

  const productHref = `product/${id}`

  const CardContent = () => (
    <View className="flex-row items-center gap-2 rounded-lg border border-border/20 bg-card p-2">
      <View className="size-16 overflow-hidden rounded-sm bg-muted">
        {showImage ? (
          <Image
            source={{ uri: imageUrl }}
            className="size-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Icon
            className="m-auto text-muted-foreground"
            as={TagIcon}
            size={ICON_SIZES.large}
          />
        )}
      </View>
      <View className="flex-1">
        <Text variant="large">{name}</Text>
        <Text variant="p" className="mt-0 text-muted-foreground sm:mt-0">
          {description}
        </Text>
      </View>
      <Icon
        className="m-auto text-muted-foreground"
        as={ChevronRightIcon}
        size={ICON_SIZES.small}
      />
    </View>
  )

  return (
    <View>
      {Platform.select({
        ios: (
          <Link href={productHref}>
            <Link.Trigger>
              <CardContent />
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={i18n.t('common.actions.share')}
                icon="square.and.arrow.up"
                onPress={() =>
                  Share.share({
                    title: i18n.t('common.actions.share'),
                    message: '/',
                  })
                }
              />
            </Link.Menu>
          </Link>
        ),
        default: (
          <Link href={productHref} asChild>
            <Pressable>
              <CardContent />
            </Pressable>
          </Link>
        ),
      })}
    </View>
  )
}
