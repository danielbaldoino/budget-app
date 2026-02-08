import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { Link } from 'expo-router'
import { ChevronRightIcon, ImageOffIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Platform, Pressable, Share, View } from 'react-native'
import type { Product } from '../_lib/utils'

export function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false)

  const { id, name, description } = product
  const imageUrl = product.images[0]?.url
  const productHref = `products/${id}`

  const handleShare = () =>
    Share.share({
      title: i18n.t('common.actions.share'),
      message: '/',
    })

  const CardContent = () => (
    <View className="flex-row items-center gap-4 bg-card px-4 py-2">
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
                onPress={handleShare}
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
