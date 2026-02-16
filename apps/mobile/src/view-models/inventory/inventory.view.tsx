import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity, View } from 'react-native'
import { useInventoryViewModel } from './inventory.view-model'

export function InventoryView() {
  const { isLoading, isError, inventoryLevels, handlerGoBack } =
    useInventoryViewModel()

  return (
    <Screen
      options={{
        title: 'Inventário',
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={handlerGoBack}
            >
              <Icon as={XIcon} />
            </TouchableOpacity>
          ),
        }),
      }}
      className="android:mb-safe"
      keyboard
      loading={isLoading}
      error={isError}
    >
      <FlatList
        contentInsetAdjustmentBehavior="always"
        data={inventoryLevels}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <View className="gap-y-4 bg-card px-4 py-2">
            <Text variant="large">{item.location.name || 'Sem nome'}</Text>
            <Text variant="small" className="text-muted-foreground">
              {item.stockedQuantity}
            </Text>
          </View>
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
