import { BottomBar } from '@/components/bottom-bar'
import { Payload } from '@/components/debug/payload'
import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { useIsPreview } from 'expo-router'
import {
  MoreHorizontalIcon,
  MoreVerticalIcon,
  ShoppingCartIcon,
} from 'lucide-react-native'
import { Platform, ScrollView, TouchableOpacity } from 'react-native'
import { QuantitySelector } from '../../components/quantity-selector'
import { useProductViewModel } from './product.view-model'

export function ProductView() {
  const { isLoading, product, isError, quantity, handleQuantityChange } =
    useProductViewModel()

  const isPreview = useIsPreview()
  const hasGlass = isLiquidGlassAvailable()

  const title = product?.name ?? i18n.t('common.states.loading')

  return (
    <Screen
      options={{
        title,
        headerLargeTitleEnabled: false,
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
      loading={isLoading}
      error={isError ? i18n.t('product.errors.loading') : undefined}
      empty={!product ? i18n.t('product.states.notFound') : undefined}
    >
      {isPreview && (
        <Text variant="h2" className="mx-4 mt-8 text-start">
          {title}
        </Text>
      )}

      <ScrollView
        contentContainerClassName={cn(
          'gap-y-4 p-4',
          hasGlass && 'pb-safe-offset-28',
        )}
      >
        <Payload payload={{ product }} />
      </ScrollView>

      {!isPreview && (
        <BottomBar
          containerClassName={cn(
            'mb-safe',
            hasGlass && 'absolute bottom-0 mx-4',
          )}
          className={cn(
            'h-24 flex-row items-center justify-between gap-4 p-4',
            !hasGlass && 'rounded-t-lg bg-primary/5',
          )}
        >
          <QuantitySelector
            className="h-full flex-1 border-muted-foreground/50 "
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />

          <Button className="min-h-16 flex-1">
            <Icon
              className="text-primary-foreground"
              size={ICON_SIZES.small}
              as={ShoppingCartIcon}
            />
            <Text>{i18n.t('product.actions.addToCart')}</Text>
          </Button>
        </BottomBar>
      )}
    </Screen>
  )
}
