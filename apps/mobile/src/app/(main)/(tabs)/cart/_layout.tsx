import { useActiveCart } from '@/hooks/use-active-cart'
import { Stack } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function CartLayout() {
  const { hasActiveCart } = useActiveCart()

  return (
    <Stack>
      <Stack.Screen name="index" />

      <Stack.Protected guard={hasActiveCart}>
        <Stack.Screen
          name="select-customer"
          options={{ presentation: 'modal' }}
        />

        <Stack.Screen name="checkout/index" />
        <Stack.Screen
          name="checkout/select-payment-method"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="checkout/select-payment-term"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="checkout/select-carrier"
          options={{ presentation: 'modal' }}
        />
      </Stack.Protected>
    </Stack>
  )
}
