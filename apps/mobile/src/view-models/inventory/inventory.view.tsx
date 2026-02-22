import { Screen } from '@/components/layout/screen'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { MapPinIcon, XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity } from 'react-native'
import { useInventoryViewModel } from './inventory.view-model'

export function InventoryView() {
  const { isLoading, isError, inventoryLevels } = useInventoryViewModel()

  return (
    <Screen
      options={{
        title: 'Inventário',
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
      }}
      className="android:mb-safe"
      keyboard
      loading={isLoading}
      error={isError}
    >
      <FlatList
        contentContainerClassName="p-4 gap-y-4"
        contentInsetAdjustmentBehavior="always"
        data={inventoryLevels}
        keyExtractor={({ id }) => id}
        renderItem={({ item: { location, stockedQuantity } }) => (
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle variant="large">
                {location?.name || 'Sem nome'}
              </CardTitle>
            </CardHeader>

            <CardContent className="gap-y-2">
              <Text variant="small" className="text-muted-foreground">
                Estoque: {stockedQuantity}
              </Text>
            </CardContent>

            <CardFooter className="gap-x-2">
              <Icon className="text-muted-foreground" as={MapPinIcon} />
              <Text
                variant="small"
                className="font-light text-muted-foreground"
              >
                {location.address?.city || 'Localização não informada'}
              </Text>
            </CardFooter>
          </Card>
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
