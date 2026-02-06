import { Stack } from 'expo-router'
import { Platform } from 'react-native'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Carrinho' }} />
      <Stack.Screen
        name="carts"
        options={{
          title: 'Todos os carrinhos',
          presentation: Platform.select({ ios: 'formSheet', default: 'modal' }),
          sheetAllowedDetents: [0.8, 1],
        }}
      />
    </Stack>
  )
}
