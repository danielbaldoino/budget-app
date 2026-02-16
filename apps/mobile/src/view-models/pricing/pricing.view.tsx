import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { ChevronRightIcon, XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity, View } from 'react-native'
import { usePricingViewModel } from './pricing.view-model'

export function PricingView() {
  const { isLoading, isError, priceSets, handlePriceSetPress } =
    usePricingViewModel()
  const { toLongPrice } = useCurrencyCode()

  return (
    <Screen
      options={{
        title: 'Preços',
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={router.back}
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
        data={priceSets}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePriceSetPress(item.priceListId)}
          >
            <View className="flex-row items-center gap-x-4 bg-card px-4 py-2">
              <View className="flex-1 gap-y-4">
                <Text variant="large">{item.priceListId || 'default'}</Text>

                {item.prices.length > 0 ? (
                  item.prices.map(({ id, amount, currencyCode }) => (
                    <Text
                      key={id}
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {toLongPrice(amount, currencyCode)}
                    </Text>
                  ))
                ) : (
                  <Text variant="small" className="text-muted-foreground">
                    Sem preços definidos
                  </Text>
                )}
              </View>
              <Icon className="text-muted-foreground" as={ChevronRightIcon} />
            </View>
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
