import { i18n } from '@/lib/languages'
import { Stack } from 'expo-router'

export default function CartLayout() {
  return <Stack screenOptions={{ title: i18n.t('cart.title') }} />
}
