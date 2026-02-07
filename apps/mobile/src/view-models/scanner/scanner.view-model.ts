import { type CameraType, useCameraPermissions } from 'expo-camera'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useScannerViewModel() {
  const [facing, setFacing] = useState<CameraType>('back')
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasPermission = !!permission?.granted
  const isLoading = permission === null

  const toggleCameraFacing = useCallback(
    () => setFacing((current) => (current === 'back' ? 'front' : 'back')),
    [],
  )

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) {
        return
      }

      setScanned(true)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      console.log('Barcode:', data)

      timeoutRef.current = setTimeout(() => setScanned(false), 1500)
    },
    [scanned],
  )

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission()
    }
  }, [permission?.granted])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    facing,
    hasPermission,
    isLoading,
    isScanned: scanned,

    toggleCameraFacing,
    handleBarcodeScanned,
  }
}
