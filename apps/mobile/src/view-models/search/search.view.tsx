import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { i18n } from '@/lib/languages'
import { QrCodeIcon } from 'lucide-react-native'
import {
  type NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
} from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import { ProductCard } from './_components/product-card'
import { useSearchViewModel } from './search.view-model'

export function SearchView() {
  const { onSearchChange, isLoading, data, errorMessage } = useSearchViewModel()
  const { colors } = useAppearance()

  const products = data?.products ?? []

  return (
    <Screen
      options={{
        headerRight: Platform.select({
          web: undefined,
          default: () => (
            <TouchableOpacity
              className="flex-row gap-2 p-2"
              disabled={Platform.select({ web: true })}
            >
              <Icon size={ICON_SIZES.small} as={QrCodeIcon} />
              {Platform.select({
                ios: <Text>{i18n.t('search.actions.qrCode')}</Text>,
              })}
            </TouchableOpacity>
          ),
        }),
        headerSearchBarOptions: Platform.select<SearchBarProps>({
          web: undefined,
          default: {
            autoCapitalize: 'sentences',
            onChangeText: ({
              nativeEvent: { text },
            }: NativeSyntheticEvent<{ text: string }>) => onSearchChange(text),
            placeholder: i18n.t('search.input.placeholder'),
            textColor: colors.text,
            tintColor: colors.primary, // iOS only
            // Android only
            shouldShowHintSearchIcon: false,
            headerIconColor: colors.text,
            hintTextColor: colors.txtMuted,
            placement: 'integratedButton',
          },
        }),
      }}
      isPending={isLoading}
      androidBottomTabInset
    >
      {errorMessage ? (
        <Text className="px-16 py-8 text-center text-destructive">
          {errorMessage}
        </Text>
      ) : products.length === 0 ? (
        <Text className="px-16 py-8 text-center text-muted-foreground">
          {i18n.t('search.states.noResults')}
        </Text>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </Screen>
  )
}
