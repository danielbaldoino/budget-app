import { ICON_SIZES } from '@/constants/theme'
import { useAppearance } from '@/hooks/use-appearance'
import { MoonIcon, SunIcon } from 'lucide-react-native'
import { Icon } from './ui/icon'

type ThemeIconProps = {
  className?: string
  size?: number
}

export function ThemeIcon({
  className,
  size = ICON_SIZES.small,
}: ThemeIconProps) {
  const { isDarkMode } = useAppearance()

  return (
    <Icon
      className={className}
      size={size}
      as={isDarkMode ? SunIcon : MoonIcon}
    />
  )
}
