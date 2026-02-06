import { useAppearance } from '@/hooks/use-appearance'
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
      indicatorColor={colors.bgPrimaryMuted} // Android only
      iconColor={{
        default: colors.txtMuted,
        selected: colors.primary,
      }}
      labelStyle={{
        default: { color: colors.txtMuted },
        selected: { color: colors.primary },
      }}
      labelVisibilityMode="labeled"
      badgeBackgroundColor={colors.notification}
      badgeTextColor={colors.txtNotification}
      minimizeBehavior="onScrollDown" // iOS only
      tintColor={colors.primary}
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
