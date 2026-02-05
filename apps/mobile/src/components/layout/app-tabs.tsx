import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  Badge,
  Icon,
  type IconProps,
  Label,
  NativeTabs,
  type NativeTabsTabBarItemRole,
  VectorIcon,
} from 'expo-router/unstable-native-tabs'
import { Platform } from 'react-native'
import { useAppearance } from '@/hooks/use-appearance'

type Props = {
  name: string
  role?: NativeTabsTabBarItemRole
  iconIos: IconProps['sf']
  iconAndroid: keyof (typeof MaterialCommunityIcons)['glyphMap']
  label?: string
  badge?: string
}

export function AppTabs({ tabs }: { tabs: Props[] }) {
  const { colors } = useAppearance()

  return (
    <NativeTabs
      backgroundColor={colors.bgPrimarySubtle}
      iconColor={colors.primary}
      indicatorColor={colors.bgPrimaryMuted} // Android only
      minimizeBehavior="onScrollDown" // iOS only
      tintColor={colors.primary}
      badgeBackgroundColor={colors.notification}
      badgeTextColor={colors.txtNotification}
    >
      {tabs.map(({ name, iconIos, iconAndroid, label, role, badge }) => (
        <NativeTabs.Trigger key={name} name={name} role={role}>
          {Platform.select({
            ios: <Icon sf={iconIos} />,
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons}
                    name={iconAndroid}
                  />
                }
              />
            ),
          })}

          {label && <Label>{label}</Label>}
          {badge && <Badge>{badge}</Badge>}
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}
