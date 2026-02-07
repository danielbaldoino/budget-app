import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { Controller } from 'react-hook-form'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useSignInViewModel } from './sign-in.view-model'

export function SignInView() {
  return (
    <Screen className="bg-foreground/5" keyboard>
      <ScrollView contentContainerClassName="flex-1 items-center justify-center p-4">
        <View className="w-full max-w-sm">
          <SignInForm />
        </View>
      </ScrollView>
    </Screen>
  )
}

function SignInForm() {
  const { control, onSubmit, isSubmitting } = useSignInViewModel()

  return (
    <Card className="rounded-lg border-border shadow-none">
      <CardHeader>
        <CardTitle variant="h4" className="text-center">
          {i18n.t('signIn.title')}
        </CardTitle>
        <CardDescription className="text-center">
          {i18n.t('signIn.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <Controller
          control={control}
          name="username"
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
                className={cn(invalid && 'border-destructive')}
                placeholder={i18n.t('signIn.username.placeholder')}
                autoComplete="username"
                autoCapitalize="none"
              />
              {invalid && (
                <Text className="text-destructive text-sm">
                  {error?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({
            field: { onChange, onBlur, value, name },
            fieldState: { invalid, error },
          }) => (
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label
                  nativeID={`form-sign-in-${name}`}
                  htmlFor={`form-sign-in-${name}`}
                >
                  {i18n.t('signIn.password.label')}
                </Label>
              </View>
              <Input
                aria-labelledby={`form-sign-in-${name}`}
                id={`form-sign-in-${name}`}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                className={cn(invalid && 'border-destructive')}
                placeholder={i18n.t('signIn.password.placeholder')}
                autoComplete="password"
                autoCapitalize="none"
                secureTextEntry
              />
              {invalid && (
                <Text className="text-destructive text-sm">
                  {error?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="workspaceId"
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
                {i18n.t('signIn.workspaceId.label')}
              </Label>
              <Input
                aria-labelledby={`form-sign-in-${name}`}
                id={`form-sign-in-${name}`}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                className={cn(invalid && 'border-destructive')}
                placeholder={i18n.t('signIn.workspaceId.placeholder')}
                autoComplete="organization"
                autoCapitalize="none"
              />
              {invalid && (
                <Text className="text-destructive text-sm">
                  {error?.message}
                </Text>
              )}
            </View>
          )}
        />

        <Button onPress={onSubmit} disabled={isSubmitting}>
          {isSubmitting && (
            <ActivityIndicator
              className="text-primary-foreground"
              size="small"
            />
          )}
          <Text>{i18n.t('signIn.actions.submit')}</Text>
        </Button>
      </CardContent>
    </Card>
  )
}
