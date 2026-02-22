import { Stack } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="checkout" />
      <Stack.Screen
        name="select-customer"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  )
}
