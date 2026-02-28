import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useAppearance } from '@/hooks/use-appearance'
import { i18n } from '@/lib/languages'
import { ScanBarcodeIcon } from 'lucide-react-native'
import {
  FlatList,
  type NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
} from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import { ProductCard } from './_components/product-card'
import { useSearchViewModel } from './search.view-model'

export function SearchView() {
  const { isLoading, isError, products, onSearchChange, handleQrCodePress } =
    useSearchViewModel()
  const { colors } = useAppearance()

  return (
    <Screen
      options={{
        title: i18n.t('search.title'),
        headerRight: Platform.select({
          native: () => (
            <TouchableOpacity
              className="flex-row gap-x-2 p-2"
              onPress={handleQrCodePress}
            >
              <Icon as={ScanBarcodeIcon} />
              {Platform.select({
                ios: <Text>{i18n.t('search.actions.qrCode')}</Text>,
              })}
            </TouchableOpacity>
          ),
        }),
        headerSearchBarOptions: Platform.select<SearchBarProps>({
          native: {
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
          },
        }),
      }}
      className="android:mb-safe-offset-20"
      keyboard
      loading={isLoading}
      error={isError ? i18n.t('search.errors.loading') : undefined}
    >
      <FlatList
        data={products}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={() => (
          <Text className="px-16 py-8 text-center text-muted-foreground">
            {i18n.t('common.states.noResults')}
          </Text>
        )}
      />
    </Screen>
  )
}
