import { Screen } from '@/components/layout/screen'
import { Icon } from '@/components/ui/icon'
import { ICON_SIZES } from '@/constants/theme'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { CameraView } from 'expo-camera'
import { router } from 'expo-router'
import { SwitchCameraIcon, XIcon } from 'lucide-react-native'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useScannerViewModel } from './scanner.view-model'

export function ScannerView() {
  const {
    facing,
    hasPermission,
    isLoading,
    isScanned,
    toggleCameraFacing,
    handleBarcodeScanned,
  } = useScannerViewModel()

  return (
    <Screen
      options={{
        title: i18n.t('scanner.title'),
        headerLargeTitleEnabled: false,
        headerTransparent: Platform.select({ ios: true, default: false }),
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={router.back}
            >
              <Icon
                className={cn(!canGoBack && 'text-muted-foreground/50')}
                size={ICON_SIZES.small}
                as={XIcon}
              />
            </TouchableOpacity>
          ),
        }),
        headerRight: () => (
          <TouchableOpacity
            className="p-2"
            onPress={toggleCameraFacing}
            disabled={!hasPermission}
          >
            <Icon
              className={cn(!hasPermission && 'text-muted-foreground/50')}
              size={ICON_SIZES.small}
              as={SwitchCameraIcon}
            />
          </TouchableOpacity>
        ),
      }}
      loading={isLoading}
      empty={!hasPermission ? i18n.t('common.permissions.camera') : undefined}
    >
      {hasPermission && (
        <CameraView
          style={{ flex: 1 }}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}

      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <View
          className={cn(
            'size-56 rounded-lg border-4 border-white/25',
            isScanned && 'border-white',
          )}
        />
      </View>
    </Screen>
  )
}
