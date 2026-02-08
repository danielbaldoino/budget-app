import { Stack } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
