import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { CheckIcon, SaveIcon, XIcon } from 'lucide-react-native'
import { Controller } from 'react-hook-form'
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { useManageCartViewModel } from './manage-cart.view-model'

export function ManageCartView() {
  const {
    control,
    onSubmit,
    isSubmitting,
    isLoading,
    isEditMode,
    handlerGoBack,
  } = useManageCartViewModel()

  return (
    <Screen
      options={{
        title: isEditMode ? 'Edit Cart' : 'Create Cart',
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              disabled={!canGoBack}
              onPress={handlerGoBack}
            >
              <Icon as={XIcon} />
            </TouchableOpacity>
          ),
        }),
        headerRight: () =>
          Platform.select({
            ios: (
              <TouchableOpacity
                className="p-2"
                onPress={onSubmit}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <ActivityIndicator className="text-foreground" size="small" />
                ) : (
                  <Icon as={CheckIcon} />
                )}
              </TouchableOpacity>
            ),
            default: (
              <Button
                variant="outline"
                onPress={onSubmit}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <ActivityIndicator className="text-foreground" size="small" />
                ) : (
                  <Icon as={SaveIcon} />
                )}
                <Text>Salvar</Text>
              </Button>
            ),
          }),
      }}
    >
      <ScrollView contentContainerClassName="flex-1 items-center justify-center p-8">
        <View className="w-full">
          <Controller
            control={control}
            name="name"
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { invalid, error },
            }) => (
              <View className="gap-1.5">
                <Label
                  nativeID={`form-sign-in-${name}`}
                  htmlFor={`form-sign-in-${name}`}
                  className={cn(invalid && 'text-destructive')}
                >
                  {i18n.t('signIn.username.label')}
                </Label>
                <Input
                  aria-labelledby={`form-sign-in-${name}`}
                  id={`form-sign-in-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn('shadow-none', invalid && 'border-destructive')}
                  placeholder={i18n.t('signIn.username.placeholder')}
                  autoComplete="username"
                  autoCapitalize="none"
                  readOnly={isSubmitting || isLoading}
                />
                {invalid && (
                  <Text className="text-destructive text-sm">
                    {error?.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>
    </Screen>
  )
}
