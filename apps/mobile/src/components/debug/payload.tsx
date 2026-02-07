import { Text } from '@/components/ui/text'
import { ScrollView, View } from 'react-native'

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
    <View className="max-h-64 rounded-lg border border-border border-dashed bg-muted">
      <ScrollView contentContainerClassName="p-2">
        <Text variant="code" className="text-muted-foreground text-xs">
          {JSON.stringify(payload, null, 2)}
        </Text>
      </ScrollView>
    </View>
  )
}
