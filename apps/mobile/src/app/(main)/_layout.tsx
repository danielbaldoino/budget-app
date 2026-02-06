import { i18n } from '@/lib/languages'
import { Stack } from 'expo-router'
import { Platform } from 'react-native'

export default function PrivateLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="carts"
        options={{
          title: i18n.t('carts.title'),
          presentation: Platform.select({ ios: 'formSheet', default: 'modal' }),
          sheetAllowedDetents: [0.8, 1],
        }}
      />
      <Stack.Screen name="product/[id]" />
    </Stack>
  )
}
