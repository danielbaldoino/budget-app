import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { PlusIcon, XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity } from 'react-native'
import { CartCard } from './_components/cart-card'
import { useCartsViewModel } from './carts.view-model'

export function CartsView() {
  const {
    isLoading,
    isError,
    carts,
    handlerGoToCreateCart,
    handlerSelectCart,
  } = useCartsViewModel()

  return (
    <Screen
      options={{
        title: i18n.t('carts.title'),
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              onPress={router.back}
              disabled={!canGoBack}
            >
              <Icon as={XIcon} />
            </TouchableOpacity>
          ),
        }),
        headerRight: () =>
          Platform.select({
            ios: (
              <TouchableOpacity className="p-2" onPress={handlerGoToCreateCart}>
                <Icon as={PlusIcon} />
              </TouchableOpacity>
            ),
            default: (
              <Button variant="outline" onPress={handlerGoToCreateCart}>
                <Icon as={PlusIcon} />
                <Text>{i18n.t('carts.actions.newCart')}</Text>
              </Button>
            ),
          }),
      }}
      loading={isLoading}
      error={isError}
    >
      <FlatList
        contentContainerClassName="p-4 gap-y-4"
        contentInsetAdjustmentBehavior="always"
        data={carts}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlerSelectCart(item.id)}>
            <CartCard cart={item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('search.states.noResults')}
          </Text>
        )}
      />
    </Screen>
  )
}
