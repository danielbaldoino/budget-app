import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { ICON_SIZES } from '@/constants/theme'
import { FilterIcon } from 'lucide-react-native'
import { TouchableOpacity } from 'react-native'

export function OrdersView() {
  return (
    <Screen
      options={{
        headerLargeTitleEnabled: false,
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon size={ICON_SIZES.small} as={FilterIcon} />
          </TouchableOpacity>
        ),
      }}
    />
  )
}
