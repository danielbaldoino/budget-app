import { AppTabs } from '@/components/layout/app-tabs'
import { useGetCart } from '@/hooks/use-cart-queries'

export default function TabsLayout() {
  const { qtyOfItems } = useGetCart()

  return (
    <AppTabs
      tabs={[
        {
          name: '(home)',
          iconIos: { default: 'house', selected: 'house.fill' },
          iconAndroid: 'home',
          label: 'Início',
        },
        {
          name: 'cart',
          iconIos: { default: 'cart', selected: 'cart.fill' },
          iconAndroid: 'cart',
          label: 'Carrinho',
          badge:
            qtyOfItems > 0
              ? qtyOfItems > 99
                ? '99+'
                : String(qtyOfItems)
              : undefined,
        },
        {
          name: 'search',
          role: 'search',
          iconIos: 'magnifyingglass',
          iconAndroid: 'magnify',
          label: 'Buscar',
        },
        {
          name: 'orders',
          iconIos: { default: 'bag', selected: 'bag.fill' },
          iconAndroid: 'shopping-outline',
          label: 'Pedidos',
        },
        {
          name: 'profile',
          iconIos: { default: 'person', selected: 'person.fill' },
          iconAndroid: 'account',
          label: 'Perfil',
        },
      ]}
    />
  )
}
