import { Stack } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="products/[productId]/index" />
      <Stack.Screen
        name="products/[productId]/select-variant"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[productId]/variants/[variantId]/pricing"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[productId]/variants/[variantId]/inventory"
        options={{ presentation: 'modal' }}
      />

      <Stack.Screen name="carts/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="carts/manage" options={{ presentation: 'modal' }} />

      <Stack.Screen
        name="price-adjustments"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  )
}
