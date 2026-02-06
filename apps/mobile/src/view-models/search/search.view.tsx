import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'
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
  const { onSearch, isLoading, data, errorMessage } = useSearchViewModel()
  const { colors } = useAppearance()

  const products = data?.products ?? []

  return (
    <Screen
      options={{
        headerRight: () => (
          <TouchableOpacity
            className="flex-row gap-2 p-2"
            disabled={Platform.select({ web: true })}
          >
            <Icon
              className={cn(
                Platform.select({ web: 'text-muted-foreground/50' }),
              )}
              size={ICON_SIZES.small}
              as={QrCodeIcon}
            />
            {Platform.select({ ios: <Text>QR code</Text> })}
          </TouchableOpacity>
        ),
        headerSearchBarOptions: Platform.select<SearchBarProps>({
          // web: undefined,
          default: {
            autoCapitalize: 'sentences',
            onChangeText: ({
              nativeEvent: { text },
            }: NativeSyntheticEvent<{ text: string }>) => onSearch(text),
            placeholder: 'Produtos, Variantes e Mais',
            textColor: colors.text,
            tintColor: colors.primary, // iOS only
            // Android only
            shouldShowHintSearchIcon: false,
            headerIconColor: colors.text,
            hintTextColor: colors.txtMuted,
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
          Nenhum produto disponível.
        </Text>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </Screen>
  )
}
