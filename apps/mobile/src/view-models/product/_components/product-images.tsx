import { Icon } from '@/components/ui/icon'
import { ICON_SIZES } from '@/constants/theme'
import { ImageOffIcon } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Image, View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductImages() {
  const { product, variant } = useProductContext()
  const [hasError, setHasError] = useState(false)

  const images = useMemo(() => {
    const result: string[] = []

    if (variant?.thumbnail) {
      result.push(variant.thumbnail)
    }

    if (variant?.images?.length) {
      result.push(
        ...variant.images
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((img) => img.url),
      )
    }

    if (product?.thumbnailUrl) {
      result.push(product.thumbnailUrl)
    }

    if (product?.images?.length) {
      result.push(
        ...product.images
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((img) => img.url),
      )
    }

    return result
  }, [product, variant])

  const imageUrl = images[0]

  const hasValidImage = Boolean(imageUrl) && !hasError

  const handleImageError = () => setHasError(true)

  return (
    <View className="h-56 overflow-hidden rounded-lg bg-muted">
      {hasValidImage ? (
        <Image
          source={{ uri: imageUrl }}
          className="size-full object-contain"
          resizeMode="contain"
          onError={handleImageError}
        />
      ) : (
        <Icon
          className="m-auto text-muted-foreground"
          as={ImageOffIcon}
          size={ICON_SIZES.large}
        />
      )}
    </View>
  )
}
