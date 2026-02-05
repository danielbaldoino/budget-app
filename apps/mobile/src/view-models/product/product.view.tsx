import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Text } from '@/components/ui/text'
import { useProductViewModel } from './product.view-model'

export function ProductView() {
  const { isLoading, product, errorMessage } = useProductViewModel()

  return (
    <Screen
      options={{
        title: product?.name || '...',
        headerLargeTitleEnabled: false,
      }}
      isPending={isLoading}
    >
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
