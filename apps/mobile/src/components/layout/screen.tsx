import { Stack } from 'expo-router'
import type { ExtendedStackNavigationOptions } from 'expo-router/build/layouts/StackClient'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { BackButtonDisplayMode } from 'react-native-screens'
import { Text } from '@/components/ui/text'
import { useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'

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
  const { colors } = useAppearance()

  const isEmpty = !children

  const headerLarge = options?.headerLargeTitleEnabled ?? true

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: Platform.select<BackButtonDisplayMode>({
            web: 'default',
            default: 'minimal',
          }),
          headerBackTitle: 'Voltar',
          headerBlurEffect: 'systemChromeMaterial',
          headerLargeStyle: {
            backgroundColor: headerLarge ? 'transparent' : undefined,
          },
          headerLargeTitleEnabled: headerLarge,
          headerShadowVisible: false,
          ...options,
        }}
      />
      <SafeAreaView
        className={cn(
          'flex-1',
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
          <ScrollView
            className={cn('flex-1', className)}
            contentContainerClassName={cn(
              'gap-4 p-4',
              constrainWidth && 'mx-auto w-full max-w-6xl',
              contentClassName,
            )}
            centerContent={isEmpty}
            scrollEnabled={scrollEnabled}
          >
            {isPending ? (
              <ActivityIndicator
                className="p-16"
                size="large"
                color={colors.primary}
              />
            ) : isEmpty ? (
              <Text variant="muted" className="p-16 text-center">
                Nenhum conteúdo disponível.
              </Text>
            ) : (
              children
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}
