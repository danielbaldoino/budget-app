import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ICON_SIZES } from '@/constants/theme'
import { cn } from '@/lib/utils'
import {
  CheckCircle2Icon,
  CheckCircleIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
} from 'lucide-react-native'
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native'
import { CheckoutProvider, useCheckoutContext } from './checkout.contetxt'

export function CheckoutView() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  )
}

function CheckoutContent() {
  const {
    isLoading,
    isError,
    cart,
    customer,
    paymentMethod,
    paymentTerm,
    carrier,
    totalItems,
    totalAmount,
    canCheckout,
    handleGoToSelectPaymentMethod,
    handleGoToSelectPaymentTerm,
    handleGoToSelectCarrier,
    handleCheckout,
  } = useCheckoutContext()

  if (!cart) {
    return null
  }

  return (
    <Screen
      options={{
        title: 'Finalizar compra',
        headerLargeTitleEnabled: false,
        headerRight: () => (
          <TouchableOpacity className="p-2">
            <Icon
              as={Platform.select({
                ios: MoreHorizontalIcon,
                default: MoreVerticalIcon,
              })}
            />
          </TouchableOpacity>
        ),
      }}
      className="android:mb-safe-offset-20"
      loading={isLoading}
      error={isError}
    >
      <ScrollView contentContainerClassName="gap-y-4 p-4">
        <Card className="rounded-lg">
          <CardHeader className="text-muted-foreground">
            <CardTitle>Pedido</CardTitle>
          </CardHeader>

          <CardContent className="gap-y-2">
            <View className="flex-row items-center justify-between gap-x-4">
              <Text className="text-muted-foreground">Moeda:</Text>
              <Text className="text-right">{cart.currencyCode}</Text>
            </View>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="text-muted-foreground">
            <CardTitle>Cliente</CardTitle>
            <CardDescription>{customer?.name || '--'}</CardDescription>
          </CardHeader>

          {customer && (
            <CardContent className="gap-y-2">
              <View className="flex-row items-center justify-between gap-x-4">
                <Text className="text-muted-foreground">
                  Tipo de documento:
                </Text>
                <Text className="text-right">
                  {customer.documentType?.toUpperCase() || '--'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between gap-x-4">
                <Text className="text-muted-foreground">Documento:</Text>
                <Text className="text-right">{customer.document || '--'}</Text>
              </View>

              <View className="flex-row items-center justify-between gap-x-4">
                <Text className="text-muted-foreground">
                  Código de referência:
                </Text>
                <Text className="text-right">
                  {customer.referenceId || '--'}
                </Text>
              </View>
            </CardContent>
          )}

          <Separator />

          <CardFooter className="gap-x-2">
            <Icon
              className={cn(
                'text-muted-foreground',
                !customer && 'text-destructive',
              )}
              size={ICON_SIZES.smaller}
              as={customer ? CheckCircleIcon : CircleAlertIcon}
            />
            <Text
              variant="small"
              className={cn(
                'font-light text-muted-foreground',
                !customer && 'text-destructive',
              )}
            >
              {customer ? 'Cliente selecionado' : 'Nenhum cliente selecionado'}
            </Text>
          </CardFooter>
        </Card>

        <Pressable onPress={handleGoToSelectPaymentMethod}>
          <Card className={cn('rounded-lg', !paymentMethod && 'border-dashed')}>
            <CardHeader className="text-muted-foreground">
              <CardTitle>Método de pagamento</CardTitle>
            </CardHeader>

            {paymentMethod && (
              <CardContent className="gap-y-2">
                <View className="flex-row items-center justify-between gap-x-4">
                  <Text className="text-muted-foreground">Nome:</Text>
                  <Text className="text-right">
                    {paymentMethod.name || '--'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between gap-x-4">
                  <Text className="text-muted-foreground">
                    Código de referência:
                  </Text>
                  <Text className="text-right">
                    {paymentMethod.code || '--'}
                  </Text>
                </View>
              </CardContent>
            )}

            <Separator />

            <CardFooter className="gap-x-2">
              <Icon
                className={cn(
                  'text-muted-foreground',
                  !paymentMethod && 'text-destructive',
                )}
                size={ICON_SIZES.smaller}
                as={paymentMethod ? CheckCircleIcon : CircleAlertIcon}
              />
              <Text
                variant="small"
                className={cn(
                  'font-light text-muted-foreground',
                  !paymentMethod && 'text-destructive',
                )}
              >
                {paymentMethod ? 'Selecionado' : 'Nenhuma seleção'}
              </Text>
              <Icon
                className="ml-auto text-muted-foreground"
                size={ICON_SIZES.smaller}
                as={ChevronRightIcon}
              />
            </CardFooter>
          </Card>
        </Pressable>

        <Pressable onPress={handleGoToSelectPaymentTerm}>
          <Card className={cn('rounded-lg', !paymentTerm && 'border-dashed')}>
            <CardHeader className="text-muted-foreground">
              <CardTitle>Condição de pagamento</CardTitle>
            </CardHeader>

            {paymentTerm && (
              <CardContent className="gap-y-2">
                <View className="flex-row items-center justify-between gap-x-4">
                  <Text className="text-muted-foreground">Nome:</Text>
                  <Text className="text-right">{paymentTerm.name || '--'}</Text>
                </View>
              </CardContent>
            )}

            <Separator />

            <CardFooter className="gap-x-2">
              <Icon
                className={cn(
                  'text-muted-foreground',
                  !paymentTerm && 'text-destructive',
                )}
                size={ICON_SIZES.smaller}
                as={paymentTerm ? CheckCircleIcon : CircleAlertIcon}
              />
              <Text
                variant="small"
                className={cn(
                  'font-light text-muted-foreground',
                  !paymentTerm && 'text-destructive',
                )}
              >
                {paymentTerm ? 'Selecionado' : 'Nenhuma seleção'}
              </Text>
              <Icon
                className="ml-auto text-muted-foreground"
                size={ICON_SIZES.smaller}
                as={ChevronRightIcon}
              />
            </CardFooter>
          </Card>
        </Pressable>

        <Pressable onPress={handleGoToSelectCarrier}>
          <Card className={cn('rounded-lg', !carrier && 'border-dashed')}>
            <CardHeader className="text-muted-foreground">
              <CardTitle>Transportadora</CardTitle>
            </CardHeader>

            {carrier && (
              <CardContent className="gap-y-2">
                <View className="flex-row items-center justify-between gap-x-4">
                  <Text className="text-muted-foreground">Nome:</Text>
                  <Text className="text-right">{carrier?.name || '--'}</Text>
                </View>
              </CardContent>
            )}

            <Separator />

            <CardFooter className="gap-x-2">
              <Icon
                className={cn(
                  'text-muted-foreground',
                  !carrier && 'text-destructive',
                )}
                size={ICON_SIZES.smaller}
                as={carrier ? CheckCircleIcon : CircleAlertIcon}
              />
              <Text
                variant="small"
                className={cn(
                  'font-light text-muted-foreground',
                  !carrier && 'text-destructive',
                )}
              >
                {carrier ? 'Selecionado' : 'Nenhuma seleção'}
              </Text>
              <Icon
                className="ml-auto text-muted-foreground"
                size={ICON_SIZES.smaller}
                as={ChevronRightIcon}
              />
            </CardFooter>
          </Card>
        </Pressable>

        <Card className="rounded-lg">
          <CardHeader className="text-muted-foreground">
            <CardTitle>Resumo</CardTitle>
          </CardHeader>

          <CardContent className="gap-y-2">
            <View className="flex-row items-center justify-between gap-x-4">
              <Text className="text-muted-foreground">Total de itens:</Text>
              <Text className="text-right">{totalItems}</Text>
            </View>
          </CardContent>

          <Separator />

          <CardFooter className="items-center justify-between gap-x-4">
            <Text className="text-muted-foreground">Preço total:</Text>
            <Text className="text-right">{totalAmount}</Text>
          </CardFooter>
        </Card>

        <Button
          className="min-h-12 flex-1"
          onPress={handleCheckout}
          disabled={!canCheckout}
        >
          <Icon className="text-primary-foreground" as={CheckCircle2Icon} />
          <Text>Enviar pedido</Text>
        </Button>
      </ScrollView>
    </Screen>
  )
}
