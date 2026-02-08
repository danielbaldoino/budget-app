import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { cn } from '@/lib/utils'
import { MinusIcon, PlusIcon } from 'lucide-react-native'
import { TouchableOpacity, View } from 'react-native'

type QuantitySelectorProps = {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  const minValue = Math.max(1, min)
  const maxValue = Math.max(minValue, max)
  const clampedQuantity = Math.min(Math.max(quantity, minValue), maxValue)

  const canDecrease = !disabled && clampedQuantity > minValue
  const canIncrease = !disabled && clampedQuantity < maxValue

  const handleDecrease = () => onQuantityChange(clampedQuantity - 1)
  const handleIncrease = () => onQuantityChange(clampedQuantity + 1)
  const handleResetToMin = () => onQuantityChange(minValue)
  const handleIncreaseBy10 = () => {
    const newQuantity = clampedQuantity + 10
    const isUnlimited = maxValue === Number.POSITIVE_INFINITY
    onQuantityChange(
      isUnlimited ? newQuantity : Math.min(newQuantity, maxValue),
    )
  }

  return (
    <View
      className={cn(
        'flex-row items-center justify-between gap-4 rounded-lg border border-border bg-card p-2',
        className,
        disabled && 'opacity-50',
      )}
    >
      <TouchableOpacity
        className="rounded-full bg-muted p-2"
        onPress={handleDecrease}
        onLongPress={handleResetToMin}
        disabled={!canDecrease}
      >
        <Icon
          as={MinusIcon}
          size={ICON_SIZES.small}
          className={cn(!canDecrease && 'text-muted-foreground/50')}
        />
      </TouchableOpacity>

      <Text className="font-medium text-xl">{clampedQuantity}</Text>

      <TouchableOpacity
        className="rounded-full bg-muted p-2"
        onPress={handleIncrease}
        onLongPress={handleIncreaseBy10}
        disabled={!canIncrease}
      >
        <Icon
          as={PlusIcon}
          size={ICON_SIZES.small}
          className={cn(!canIncrease && 'text-muted-foreground/50')}
        />
      </TouchableOpacity>
    </View>
  )
}
