import { cn } from '@/lib/utils'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { View } from 'react-native'

const BORDER_RADIUS = 32

export function BottomBar({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}) {
  const hasGlass = isLiquidGlassAvailable()

  const content = <View className={cn('w-full', className)}>{children}</View>

  return (
    <View className={containerClassName}>
      {hasGlass ? (
        <GlassView
          // GlassView does not support className
          style={{ borderRadius: BORDER_RADIUS }}
        >
          {content}
        </GlassView>
      ) : (
        content
      )}
    </View>
  )
}
