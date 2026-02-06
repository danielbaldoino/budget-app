import { i18n } from '@/lib/languages'
import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return <Stack screenOptions={{ title: i18n.t('profile.title') }} />
}
