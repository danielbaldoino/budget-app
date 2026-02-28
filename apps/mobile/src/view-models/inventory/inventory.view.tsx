import { Screen } from '@/components/layout/screen'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { MapPinIcon, XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity, View } from 'react-native'
import { useInventoryViewModel } from './inventory.view-model'

export function InventoryView() {
  const { isLoading, isError, inventoryLevels } = useInventoryViewModel()

  return (
    <Screen
      options={{
        title: i18n.t('inventory.title'),
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
              <CardTitle>
                {location?.name || i18n.t('common.fallback.noName')}
              </CardTitle>
            </CardHeader>

            <CardContent className="gap-y-2">
              <View className="flex-row items-center justify-between gap-x-4">
                <Text className="text-muted-foreground">
                  Estoque disponível:
                </Text>
                <Text className="text-right">{stockedQuantity}</Text>
              </View>
            </CardContent>

            <Separator />

            <CardFooter className="gap-x-2">
              <Icon
                className="text-muted-foreground"
                size={ICON_SIZES.smaller}
                as={MapPinIcon}
              />
              <Text
                variant="small"
                className="font-light text-muted-foreground"
              >
                {location.address?.city ||
                  i18n.t('inventory.fallback.noLocation')}
              </Text>
            </CardFooter>
          </Card>
        )}
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('common.states.noResults')}
          </Text>
        )}
      />
    </Screen>
  )
}
