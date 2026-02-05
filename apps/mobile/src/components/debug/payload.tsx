import { ScrollView, View } from 'react-native'
import { Text } from '@/components/ui/text'

/**
 * Component to display a JSON payload in a formatted manner.
 *
 * Note: This component is intended for debugging purposes.
 *
 * @param payload - The payload to display.
 * @returns A React component rendering the formatted payload.
 */
export function Payload({ payload }: { payload: unknown }) {
  return (
    <View className="max-h-64 rounded-xl border border-border border-dashed bg-muted">
      <ScrollView className="p-2">
        <Text variant="code" className="text-muted-foreground text-xs">
          {JSON.stringify(payload, null, 2)}
        </Text>
      </ScrollView>
    </View>
  )
}
