import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { useIsPreview } from 'expo-router'
import { MoreHorizontalIcon, MoreVerticalIcon } from 'lucide-react-native'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { ProductActionsBar } from './_components/product-actions-bar'
import { ProductCategory } from './_components/product-category'
import { ProductDescription } from './_components/product-description'
import { ProductImages } from './_components/product-images'
import { ProductInventoryCard } from './_components/product-inventory-card'
import { ProductNotes } from './_components/product-notes'
import { ProductPriceCard } from './_components/product-price-card'
import { ProductPriceSettingsCard } from './_components/product-price-settings-card'
import { ProductVariantInfo } from './_components/product-variant-info'
import { SelectVariantButton } from './_components/select-variant-button'
import { ProductProvider, useProductContext } from './product.context'

export function ProductView() {
  return (
    <ProductProvider>
      <ProductContent />
    </ProductProvider>
  )
}

function ProductContent() {
  const { isLoading, isError, product } = useProductContext()
  const isPreview = useIsPreview()

  const productName = product?.name ?? i18n.t('common.states.loading')

  return (
    <Screen
      options={{
        title: productName,
        headerLargeTitleEnabled: false,
        headerTitleAlign: 'center',
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
      keyboard
      loading={isLoading}
      error={isError ? i18n.t('product.errors.loading') : undefined}
      empty={!product ? i18n.t('product.states.notFound') : undefined}
    >
      {isPreview && (
        <Text variant="h2" className="mx-4 mt-8 text-start">
          {productName}
        </Text>
      )}

      <ScrollView
        contentContainerClassName={cn(
          'gap-y-4 p-4 pb-10',
          isLiquidGlassAvailable() && 'pb-safe-offset-36',
        )}
      >
        <ProductImages />
        <View className="flex-row items-start justify-between gap-x-4">
          <ProductCategory />
          <ProductPriceCard />
        </View>
        <Separator />
        <ProductVariantInfo />
        <ProductDescription />
        <SelectVariantButton />
        <ProductInventoryCard />
        <Separator />
        <ProductPriceSettingsCard />
        <ProductNotes />
      </ScrollView>
      {!isPreview && <ProductActionsBar />}
    </Screen>
  )
}
