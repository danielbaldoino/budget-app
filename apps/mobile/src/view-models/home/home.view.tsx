import { InfoIcon } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'
import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { ProductCard } from './_components/product-card'
import { useHomeViewModel } from './home.view-model'

export function HomeView() {
  const { recentProducts } = useHomeViewModel()
  const { colors } = useAppearance()

  return (
    <Screen androidBottomTabInset>
      <View className="rounded-xl bg-muted p-4">
        <View className="flex-row items-center gap-x-2">
          <Icon as={InfoIcon} size={ICON_SIZES.small} />
          <Text variant="large">Em desenvolvimento</Text>
        </View>
        <Text variant="p" className="text-muted-foreground text-sm sm:mt-3">
          Este aplicativo está em fase de desenvolvimento e pode conter bugs ou
          funcionalidades incompletas.
        </Text>
      </View>

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
