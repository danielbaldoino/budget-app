import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useAppearance } from '@/hooks/use-appearance'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { XIcon } from 'lucide-react-native'
import {
  FlatList,
  type NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
} from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import { VariantCard } from './_components/variant-card'
import { useSelectVariantViewModel } from './select-variant.view-model'

export function SelectVariantView() {
  const { isLoading, isError, variants, onSearchChange, handleVariantPress } =
    useSelectVariantViewModel()
  const { colors } = useAppearance()

  return (
    <Screen
      options={{
        title: i18n.t('selectVariant.title'),
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
        headerSearchBarOptions: Platform.select<SearchBarProps>({
          native: {
            autoCapitalize: 'sentences',
            onChangeText: ({
              nativeEvent: { text },
            }: NativeSyntheticEvent<{ text: string }>) => onSearchChange(text),
            placeholder: i18n.t('selectVariant.search.placeholder'),
            textColor: colors.text,
            tintColor: colors.primary, // iOS only
            // Android only
            shouldShowHintSearchIcon: false,
            headerIconColor: colors.text,
            hintTextColor: colors.txtMuted,
          },
        }),
      }}
      className="android:mb-safe"
      keyboard
      loading={isLoading}
      error={isError}
    >
      <FlatList
        contentInsetAdjustmentBehavior="always"
        data={variants}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleVariantPress(item.id)}>
            <VariantCard variant={item} />
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
