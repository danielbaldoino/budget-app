import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useIsPreview } from 'expo-router'
import { MoreHorizontalIcon, MoreVerticalIcon } from 'lucide-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import { useProductViewModel } from './product.view-model'

export function ProductView() {
  const { isLoading, product, errorMessage } = useProductViewModel()
  const isPreview = useIsPreview()

  const title = product?.name || '...'

  return (
    <Screen
      options={{
        title,
        headerLargeTitleEnabled: false,
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon
              size={ICON_SIZES.small}
              as={Platform.select({
                ios: MoreHorizontalIcon,
                default: MoreVerticalIcon,
              })}
            />
          </TouchableOpacity>
        ),
      }}
      isPending={isLoading}
    >
      {isPreview && (
        <Text variant="h1" className="mt-0 rounded-lg text-start">
          {title}
        </Text>
      )}

      {errorMessage ? (
        <Text className="px-16 py-8 text-center text-destructive">
          Não foi possível carregar o produto.
        </Text>
      ) : !product ? (
        <Text className="px-16 py-8 text-center text-muted-foreground">
          Nenhum produto foi encontrado.
        </Text>
      ) : (
        <Payload payload={{ product }} />
      )}
    </Screen>
  )
}
