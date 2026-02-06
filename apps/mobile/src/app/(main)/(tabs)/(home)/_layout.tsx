import { i18n } from '@/lib/languages'
import { Stack } from 'expo-router'

export default function HomeLayout() {
  return <Stack screenOptions={{ title: i18n.t('home.title') }} />
}
