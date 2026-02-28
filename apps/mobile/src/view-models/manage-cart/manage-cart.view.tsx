import { Screen } from '@/components/layout/screen'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { CURRENCY_CODES } from '@/constants/currency'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { router } from 'expo-router'
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
  const { control, onSubmit, isSubmitting, isLoading, isEditMode } =
    useManageCartViewModel()

  return (
    <Screen
      options={{
        title: isEditMode
          ? i18n.t('manageCart.title.edit')
          : i18n.t('manageCart.title.create'),
        headerLargeTitleEnabled: false,
        headerLeft: Platform.select({
          ios: ({ canGoBack }) => (
            <TouchableOpacity
              className="p-2"
              onPress={router.back}
              disabled={!canGoBack}
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
                <Text>{i18n.t('common.actions.save')}</Text>
              </Button>
            ),
          }),
      }}
      keyboard
    >
      <ScrollView contentContainerClassName="p-6">
        <View className="w-full gap-y-6">
          <Controller
            control={control}
            name="name"
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { invalid, error },
            }) => (
              <View className="gap-1.5">
                <Label
                  nativeID={`form-cart-${name}`}
                  htmlFor={`form-cart-${name}`}
                  className={cn(invalid && 'text-destructive')}
                >
                  {i18n.t('common.labels.name')}
                </Label>
                <Input
                  aria-labelledby={`form-cart-${name}`}
                  id={`form-cart-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn('shadow-none', invalid && 'border-destructive')}
                  placeholder={i18n.t('manageCart.fields.name.placeholder')}
                  autoCapitalize="characters"
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

          <Controller
            control={control}
            name="currencyCode"
            render={({
              field: { onChange, value, name },
              fieldState: { invalid, error },
            }) => (
              <View className="gap-1.5">
                <Label
                  nativeID={`form-cart-${name}`}
                  className={cn(invalid && 'text-destructive')}
                >
                  {i18n.t('common.labels.currency')}
                </Label>
                <Select
                  onValueChange={(e) => onChange(e?.value)}
                  value={{ label: value, value }}
                >
                  <SelectTrigger
                    aria-labelledby={`form-cart-${name}`}
                    className={cn(invalid && 'border-destructive')}
                  >
                    <SelectValue
                      className="placeholder:text-muted-foreground"
                      placeholder={i18n.t(
                        'manageCart.fields.currency.placeholder',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        {i18n.t('common.labels.currency')}
                      </SelectLabel>
                      {CURRENCY_CODES.map((currency) => (
                        <SelectItem
                          key={currency}
                          label={currency}
                          value={currency}
                        >
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {invalid && (
                  <Text className="text-destructive text-sm">
                    {error?.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Separator />

          <Controller
            control={control}
            name="notes"
            render={({
              field: { onChange, onBlur, value, name },
              fieldState: { invalid, error },
            }) => (
              <View className="gap-1.5">
                <View className="flex-row items-center">
                  <Label
                    nativeID={`form-cart-${name}`}
                    htmlFor={`form-cart-${name}`}
                    className={cn(invalid && 'border-destructive')}
                  >
                    {i18n.t('common.labels.notes')}
                  </Label>
                </View>

                <Textarea
                  aria-labelledby={`form-cart-${name}`}
                  id={`form-cart-${name}`}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  className={cn(
                    'min-h-32 placeholder:font-light placeholder:text-muted-foreground',
                    invalid && 'border-destructive',
                  )}
                  placeholder={i18n.t('manageCart.fields.notes.placeholder')}
                  autoCapitalize="sentences"
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
