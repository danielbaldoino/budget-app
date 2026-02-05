import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Text } from '@/components/ui/text'
import { useCartViewModel } from './cart.view-model'

export function CartView() {
  const { isLoading, cart } = useCartViewModel()

  return (
    <Screen isPending={isLoading} androidBottomTabInset>
      {!cart ? (
        <Text className="px-16 py-8 text-center text-muted-foreground">
          Nenhum carrinho foi encontrado.
        </Text>
      ) : (
        <Payload payload={{ cart }} />
      )}
    </Screen>
  )
}
