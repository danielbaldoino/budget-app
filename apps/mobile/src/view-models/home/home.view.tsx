import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { MoreHorizontalIcon, MoreVerticalIcon } from 'lucide-react-native'
import {
  ActivityIndicator,
  Platform,
  SectionList,
  TouchableOpacity,
} from 'react-native'
import { ProductCard } from './_components/product-card'
import { useHomeViewModel } from './home.view-model'

export function HomeView() {
  const { recentProducts } = useHomeViewModel()

  const sections = [
    {
      key: 'recent-products',
      title: i18n.t('home.recentProducts.title'),
      data: recentProducts.products,
    },
  ]

  return (
    <Screen
      options={{
        title: i18n.t('home.title'),
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon
              size={ICON_SIZES.small}
              as={Platform.select({
                ios: MoreHorizontalIcon,
                default: MoreVerticalIcon,
              })}
            />
          </TouchableOpacity>
        ),
      }}
      className="android:mb-safe-offset-20"
    >
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-y-2 p-4"
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text variant="h2">{section.title}</Text>
        )}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          recentProducts.isLoading ? (
            <ActivityIndicator className="py-8 text-primary" size="large" />
          ) : recentProducts.isError ? (
            <Text className="py-8 text-center text-destructive">
              {i18n.t('home.recentProducts.errors.loading')}
            </Text>
          ) : (
            <Text className="py-8 text-center text-muted-foreground">
              {i18n.t('home.recentProducts.states.empty')}
            </Text>
          )
        }
      />
    </Screen>
  )
}
