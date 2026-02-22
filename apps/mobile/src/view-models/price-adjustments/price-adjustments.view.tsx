import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { router } from 'expo-router'
import { XIcon } from 'lucide-react-native'
import { Platform, TouchableOpacity } from 'react-native'

export function PriceAdjustmentsView() {
  return (
    <Screen
      options={{
        title: 'Price Adjustments',
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
    />
  )
}
