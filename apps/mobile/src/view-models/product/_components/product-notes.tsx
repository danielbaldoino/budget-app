import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { i18n } from '@/lib/languages'
import { cn } from '@/lib/utils'
import { Controller } from 'react-hook-form'
import { View } from 'react-native'
import { useProductContext } from '../product.context'

export function ProductNotes() {
  const {
    variant,
    form: {
      control,
      formState: { isSubmitting },
    },
  } = useProductContext()

  return (
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
              nativeID={`form-product-${name}`}
              htmlFor={`form-product-${name}`}
              className={cn(
                !variant && 'cursor-not-allowed text-muted-foreground',
                invalid && 'border-destructive',
              )}
            >
              {i18n.t('common.labels.notes')}
            </Label>
          </View>

          <Textarea
            aria-labelledby={`form-product-${name}`}
            id={`form-product-${name}`}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            className={cn(
              'min-h-32 placeholder:font-light placeholder:text-muted-foreground',
              invalid && 'border-destructive',
            )}
            placeholder={i18n.t('product.form.notes.placeholder')}
            autoCapitalize="sentences"
            readOnly={isSubmitting || !variant}
          />

          {invalid && (
            <Text className="text-destructive text-sm">{error?.message}</Text>
          )}
        </View>
      )}
    />
  )
}
