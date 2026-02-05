import { Controller } from 'react-hook-form'
import { ActivityIndicator, View } from 'react-native'
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
import { cn } from '@/lib/utils'
import { useSignInViewModel } from './sign-in.view-model'

export function SignInView() {
  const { form, onSubmit } = useSignInViewModel()

  return (
    <Screen
      safeAreaEdges={{ top: true, bottom: true }}
      className="bg-foreground/5"
      contentClassName="flex-1 justify-center"
    >
      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle variant="h4" className="text-center">
            Entre na sua conta
          </CardTitle>
          <CardDescription className="text-center">
            Por favor, faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <Controller
            control={form.control}
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
                  Nome de usuário
                </Label>
                <Input
                  aria-labelledby={`form-sign-in-${name}`}
                  id={`form-sign-in-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn(invalid && 'border-destructive')}
                  placeholder="Digite seu nome de usuário"
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
            control={form.control}
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
                    Senha
                  </Label>
                  {/* <Button
                        variant="link"
                        size="sm"
                        className="ml-auto h-4 web:h-fit px-1 py-0 sm:h-4"
                      >
                        <Text className="font-normal leading-4">
                          Esqueceu sua senha?
                        </Text>
                      </Button> */}
                </View>
                <Input
                  aria-labelledby={`form-sign-in-${name}`}
                  id={`form-sign-in-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn(invalid && 'border-destructive')}
                  placeholder="Digite sua senha"
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
            control={form.control}
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
                  ID do Workspace
                </Label>
                <Input
                  aria-labelledby={`form-sign-in-${name}`}
                  id={`form-sign-in-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn(invalid && 'border-destructive')}
                  placeholder="Digite o ID do seu workspace"
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

          <Button
            onPress={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <ActivityIndicator
                className="text-primary-foreground"
                size="small"
              />
            )}
            <Text>Continuar</Text>
          </Button>
        </CardContent>
      </Card>
    </Screen>
  )
}
