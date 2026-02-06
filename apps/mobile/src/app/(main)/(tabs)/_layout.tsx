import { AppTabs } from '@/components/layout/app-tabs'
import { useCurrentCartQuery } from '@/hooks/use-cart-queries'
import { i18n } from '@/lib/languages'

export default function TabsLayout() {
  const { quantityOfItems } = useCurrentCartQuery()

  const cartBadge =
    quantityOfItems > 0
      ? quantityOfItems > 99
        ? '99+'
        : String(quantityOfItems)
      : undefined

  return (
    <AppTabs
      tabs={[
        {
          name: '(home)',
          iconIos: { default: 'house', selected: 'house.fill' },
          iconAndroid: 'home',
          label: i18n.t('home.title'),
        },
        {
          name: 'cart',
          iconIos: { default: 'cart', selected: 'cart.fill' },
          iconAndroid: 'cart',
          label: i18n.t('cart.title'),
          badge: cartBadge,
        },
        {
          name: 'search',
          role: 'search',
          iconIos: 'magnifyingglass',
          iconAndroid: 'magnify',
          label: i18n.t('search.title'),
        },
        {
          name: 'orders',
          iconIos: { default: 'bag', selected: 'bag.fill' },
          iconAndroid: 'shopping-outline',
          label: i18n.t('orders.title'),
        },
        {
          name: 'profile',
          iconIos: { default: 'person', selected: 'person.fill' },
          iconAndroid: 'account',
          label: i18n.t('profile.title'),
        },
      ]}
    />
  )
}
