import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { router } from 'expo-router'
import { XIcon } from 'lucide-react-native'
import { Platform, ScrollView, TouchableOpacity } from 'react-native'
import { usePriceAdjustmentsViewModel } from './price-adjustments.view-model'

export function PriceAdjustmentsView() {
  const {} = usePriceAdjustmentsViewModel()

  return (
    <Screen
      options={{
        title: 'Price Adjustments',
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
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 px-4"
      >
        <Text>Price Adjustments</Text>
      </ScrollView>
    </Screen>
  )
}
