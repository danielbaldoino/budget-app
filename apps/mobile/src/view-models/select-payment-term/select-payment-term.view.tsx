import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useAppearance } from '@/hooks/use-appearance'
import { i18n } from '@/lib/languages'
import { router } from 'expo-router'
import { BoxIcon, ChevronRightIcon, XIcon } from 'lucide-react-native'
import {
  FlatList,
  type NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native'
import type { SearchBarProps } from 'react-native-screens'
import { useSelectPaymentTermViewModel } from './select-payment-term.view-model'

export function SelectPaymentTermView() {
  const {
    isLoading,
    isError,
    paymentTerms,
    onSearchChange,
    handlePaymentTermPress,
  } = useSelectPaymentTermViewModel()
  const { colors } = useAppearance()

  return (
    <Screen
      options={{
        title: 'Condições de Pagamento',
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
            placeholder: 'Pesquisar',
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
        data={paymentTerms}
        keyExtractor={({ id }) => id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePaymentTermPress(item.id)}>
            <View className="flex-row items-center gap-x-4 bg-card px-4 py-2">
              <View className="size-16 overflow-hidden rounded-sm bg-muted">
                <Icon className="m-auto text-muted-foreground" as={BoxIcon} />
              </View>
              <View className="flex-1">
                <Text variant="large">{item.name}</Text>
                <Text variant="p" className="text-muted-foreground">
                  {item.code}
                </Text>
              </View>
              <Icon className="text-muted-foreground" as={ChevronRightIcon} />
            </View>
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
