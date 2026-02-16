import { Stack } from 'expo-router'
import { Platform } from 'react-native'

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
        options={{
          presentation: Platform.select({ ios: 'formSheet', default: 'modal' }),
          sheetAllowedDetents: [0.8, 1],
        }}
      />
      <Stack.Screen
        name="products/[productId]/variants/[variantId]/pricing"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[productId]/variants/[variantId]/inventory"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[productId]/variants/[variantId]/price-adjustments"
        options={{ presentation: 'modal' }}
      />

      <Stack.Screen
        name="carts/index"
        options={{
          presentation: Platform.select({ ios: 'formSheet', default: 'modal' }),
          sheetAllowedDetents: [0.8, 1],
        }}
      />
      <Stack.Screen name="carts/manage" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
