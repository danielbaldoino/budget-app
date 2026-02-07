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
  const _min = Math.max(1, min)
  const _max = Math.max(_min, max)
  const _quantity = Math.min(Math.max(quantity, _min), _max)

  const canDecrease = !disabled && _quantity > _min
  const canIncrease = !disabled && _quantity < _max

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
        onPress={() => onQuantityChange(_quantity - 1)}
        onLongPress={() => onQuantityChange(_min)}
        disabled={!canDecrease}
      >
        <Icon
          as={MinusIcon}
          size={ICON_SIZES.small}
          className={cn(!canDecrease && 'text-muted-foreground/50')}
        />
      </TouchableOpacity>

      <Text className="font-medium text-xl">{_quantity}</Text>

      <TouchableOpacity
        className="rounded-full bg-muted p-2"
        onPress={() => onQuantityChange(_quantity + 1)}
        onLongPress={() =>
          onQuantityChange(
            _max === Number.POSITIVE_INFINITY
              ? _quantity + 10
              : _quantity + 10 > _max
                ? _max
                : _quantity + 10,
          )
        }
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
