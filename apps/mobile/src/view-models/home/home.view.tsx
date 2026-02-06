import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { MoreHorizontalIcon, MoreVerticalIcon } from 'lucide-react-native'
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native'
import { ProductCard } from './_components/product-card'
import { useHomeViewModel } from './home.view-model'

export function HomeView() {
  const { recentProducts } = useHomeViewModel()
  const { colors } = useAppearance()

  return (
    <Screen
      options={{
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
      androidBottomTabInset
    >
      {recentProducts.isLoading ? (
        <ActivityIndicator
          className="py-8"
          size="large"
          color={colors.primary}
        />
      ) : recentProducts.isError ? (
        <Text className="py-8 text-center text-destructive">
          Não foi possível carregar os produtos.
        </Text>
      ) : recentProducts.products.length === 0 ? (
        <Text className="py-8 text-center text-muted-foreground">
          Nenhum produto foi encontrado.
        </Text>
      ) : (
        recentProducts.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </Screen>
  )
}
