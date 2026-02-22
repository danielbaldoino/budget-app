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
import { useCurrencyCode } from '@/hooks/use-currency-code'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { ChevronRightIcon, XIcon } from 'lucide-react-native'
import { FlatList, Platform, TouchableOpacity } from 'react-native'
import { usePricingViewModel } from './pricing.view-model'

export function PricingView() {
  const { isLoading, isError, priceSets, handlePriceSetPress } =
    usePricingViewModel()
  const { toLongPrice } = useCurrencyCode()

  return (
    <Screen
      options={{
        title: i18n.t('pricing.title'),
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
        data={priceSets}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePriceSetPress(item.priceListId)}
          >
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle variant="large">
                  {item.priceListId ||
                    i18n.t('pricing.fallback.defaultPriceList')}
                </CardTitle>
              </CardHeader>

              <CardContent className="gap-y-2">
                {item.prices.length ? (
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
                    {i18n.t('pricing.states.noPrices')}
                  </Text>
                )}
              </CardContent>

              <CardFooter>
                <Text
                  variant="small"
                  className="font-light text-muted-foreground"
                >
                  {i18n.t('pricing.actions.selectHint')}
                </Text>
                <Icon
                  className="ml-auto text-muted-foreground"
                  as={ChevronRightIcon}
                />
              </CardFooter>
            </Card>
          </TouchableOpacity>
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
