import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { Stack, useIsPreview } from 'expo-router'
import type { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient'
import { ActivityIndicator, Platform } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { type Edges, SafeAreaView } from 'react-native-safe-area-context'
import type { BackButtonDisplayMode } from 'react-native-screens'

type Props = {
  children?: React.ReactNode
  options?: ExtendedStackNavigationOptions
  safeAreaEdges?: Edges
  className?: string
  keyboard?: boolean
  loading?: boolean | React.ReactNode
  error?: string | React.ReactNode
  empty?: boolean | string | React.ReactNode
}

export function Screen({
  children,
  options,
  safeAreaEdges = [],
  className,
  keyboard = false,
  loading = false,
  error,
  empty,
}: Props) {
  const isPreview = useIsPreview()

  const headerLargeEnabled = options?.headerLargeTitleEnabled ?? true

  const inferredEmpty = empty ?? (children === undefined || children === null)

  const content = (() => {
    if (loading) {
      if (typeof loading === 'boolean') {
        return (
          <ActivityIndicator
            className="m-auto p-16 text-primary"
            size="large"
          />
        )
      }

      return loading
    }

    if (error) {
      return typeof error === 'string' ? (
        <Text className="m-auto p-16 text-center text-destructive">
          {error}
        </Text>
      ) : (
        error
      )
    }

    if (inferredEmpty) {
      if (typeof inferredEmpty === 'boolean') {
        return (
          <Text variant="muted" className="m-auto p-16 text-center">
            {i18n.t('common.states.noContent')}
          </Text>
        )
      }

      if (typeof inferredEmpty === 'string') {
        return (
          <Text variant="muted" className="m-auto p-16 text-center">
            {inferredEmpty}
          </Text>
        )
      }

      return inferredEmpty
    }

    if (keyboard) {
      return (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.select({ ios: 'padding', default: undefined })}
        >
          {children}
        </KeyboardAvoidingView>
      )
    }

    return children
  })()

  return (
    <>
      {!isPreview && (
        <Stack.Screen
          options={{
            headerBackButtonDisplayMode: Platform.select<BackButtonDisplayMode>(
              { web: 'default', default: 'minimal' },
            ),
            headerBackTitle: i18n.t('common.actions.back'),
            headerBlurEffect: 'systemChromeMaterial',
            headerShadowVisible: false,

            ...(headerLargeEnabled && {
              headerLargeTitleEnabled: true,
              headerLargeStyle: {
                backgroundColor: 'transparent',
              },
            }),

            ...options,
          }}
        />
      )}

      <SafeAreaView
        className={cn('flex-1 bg-background', className)}
        edges={safeAreaEdges}
      >
        {content}
      </SafeAreaView>
    </>
  )
}
