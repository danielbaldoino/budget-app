import { type CameraType, useCameraPermissions } from 'expo-camera'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useScannerViewModel() {
  const [facing, setFacing] = useState<CameraType>('back')
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleCameraFacing = useCallback(
    () => setFacing((current) => (current === 'back' ? 'front' : 'back')),
    [],
  )

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) {
        return
      }

      setScanned(true)

      notificationAsync(NotificationFeedbackType.Success)

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
    scanned,
    isLoading: permission === null,
    hasPermission: Boolean(permission?.granted),

    toggleCameraFacing,
    onBarcodeScanned,
  }
}
