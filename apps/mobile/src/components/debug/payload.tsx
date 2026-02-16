import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { setStringAsync } from 'expo-clipboard'
import { Alert, Pressable, ScrollView, View } from 'react-native'

/**
 * Component to display a JSON payload in a formatted manner.
 *
 * Note: This component is intended for debugging purposes.
 *
 * @param payload - The payload to display.
 * @returns A React component rendering the formatted payload.
 */
export function Payload({ payload }: { payload: unknown }) {
  if (!__DEV__) {
    return null
  }

  const formattedPayload = JSON.stringify(payload, null, 2)

  const handleCopyToClipboard = async () => {
    await setStringAsync(formattedPayload)

    Alert.alert(
      i18n.t('common.actions.copy'),
      i18n.t('common.messages.copiedToClipboard'),
    )
  }

  return (
    <View className="max-h-64 rounded-lg border border-border border-dashed bg-muted">
      <ScrollView contentContainerClassName="p-2">
        <Pressable onLongPress={handleCopyToClipboard}>
          <Text variant="code" className="text-muted-foreground text-xs">
            {formattedPayload}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
