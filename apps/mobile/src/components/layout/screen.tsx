import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { Stack, useIsPreview } from 'expo-router'
import type { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient'
import { Fragment } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BackButtonDisplayMode } from 'react-native-screens'

type Props = {
  children?: React.ReactNode
  options?: ExtendedStackNavigationOptions
  safeAreaEdges?: { top?: boolean; bottom?: boolean }
  className?: string
  contentClassName?: string
  scrollEnabled?: boolean
  isPending?: boolean
  androidBottomTabInset?: boolean
  constrainWidth?: boolean
}

export function Screen({
  children,
  options,
  safeAreaEdges,
  className,
  contentClassName,
  scrollEnabled,
  isPending,
  androidBottomTabInset,
  constrainWidth = true,
}: Props) {
  const isPreview = useIsPreview()

  const isEmpty = !children
  const headerLarge = options?.headerLargeTitleEnabled ?? true

  return (
    <Fragment>
      {!isPreview && (
        <Stack.Screen
          options={{
            headerBackButtonDisplayMode: Platform.select<BackButtonDisplayMode>(
              { web: 'default', default: 'minimal' },
            ),
            headerBackTitle: i18n.t('common.actions.back'),
            headerBlurEffect: 'systemChromeMaterial',
            headerLargeStyle: {
              backgroundColor: headerLarge ? 'transparent' : undefined,
            },
            headerLargeTitleEnabled: headerLarge,
            headerShadowVisible: false,
            ...options,
          }}
        />
      )}

      <SafeAreaView
        className={cn(
          'flex-1 bg-background',
          androidBottomTabInset && 'android:mb-safe-offset-20',
        )}
        edges={{
          top: safeAreaEdges?.top ? 'maximum' : undefined,
          bottom: Platform.select({
            android: androidBottomTabInset || safeAreaEdges?.bottom,
            default: safeAreaEdges?.bottom,
          })
            ? 'maximum'
            : undefined,
        }}
        mode={Platform.select({
          android: androidBottomTabInset ? 'margin' : undefined,
        })}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className={cn('flex-1', className)}
              contentContainerClassName={cn(
                'gap-4 p-4 lg:gap-6 lg:p-6',
                constrainWidth && 'mx-auto w-full max-w-6xl',
                contentClassName,
              )}
              centerContent={isEmpty}
              scrollEnabled={scrollEnabled}
            >
              {isPending ? (
                <ActivityIndicator className="p-16 text-primary" size="large" />
              ) : isEmpty ? (
                <Text variant="muted" className="p-16 text-center">
                  {i18n.t('common.states.noContent')}
                </Text>
              ) : (
                children
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  )
}
