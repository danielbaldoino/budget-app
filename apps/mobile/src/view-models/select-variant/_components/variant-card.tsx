import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ChevronRightIcon, ImageOffIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Image, View } from 'react-native'
import type { Variant } from '../_lib/types'

export function VariantCard({ variant }: { variant: Variant }) {
  const [imageError, setImageError] = useState(false)

  const { name, sku } = variant
  const imageUrl = variant.images[0]?.url

  return (
    <View className="flex-row items-center gap-x-4 bg-card px-4 py-2">
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
      <View className="flex-1">
        <Text variant="large">{name}</Text>
        <Text variant="p" className="text-muted-foreground">
          {sku}
        </Text>
      </View>
      <Icon className="text-muted-foreground" as={ChevronRightIcon} />
    </View>
  )
}
