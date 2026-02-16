import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
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
        keyExtractor={({ id }) => id}
        // SectionList does not support className on the web.
        contentContainerStyle={{ gap: 8, padding: 16 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text variant="h2">{title}</Text>
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
