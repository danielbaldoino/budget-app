import { Stack } from 'expo-router'
import { Platform } from 'react-native'

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="carts"
        options={{
          presentation: Platform.select({ ios: 'formSheet', default: 'modal' }),
          sheetAllowedDetents: [0.8, 1],
        }}
      />

      <Stack.Screen name="products/[id]/index" />
      <Stack.Screen
        name="products/[id]/variants"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[id]/pricing"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="products/[id]/inventory"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  )
}
