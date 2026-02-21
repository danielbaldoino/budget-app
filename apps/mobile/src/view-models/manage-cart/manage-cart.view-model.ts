import { CURRENCY_CODES } from '@/constants/currency'
import { VALIDATION } from '@/constants/validation'
import { useActiveCart } from '@/hooks/use-active-cart'
import { sdk } from '@/lib/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.MIN_INPUT_LENGTH, 'Name must be at least 1 character'),
  currencyCode: z.enum(CURRENCY_CODES),
  notes: z
    .string()
    .max(VALIDATION.MAX_INPUT_LENGTH, 'Notes must be at most 255 characters')
    .optional(),
})

type CartFormData = z.infer<typeof formSchema>

export function useManageCartViewModel() {
  const { mode } = useLocalSearchParams<{
    mode: 'create' | 'edit'
  }>()

  const isEditMode = mode === 'edit'

  const { isLoading, cart, refetch, setActiveCartId } = useActiveCart({
    enabled: isEditMode,
  })

  const { mutateAsync: createCart } = sdk.v1.$reactQuery.useCreateCart()
  const { mutateAsync: updateCart } = sdk.v1.$reactQuery.useUpdateCart()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CartFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      // currencyCode: CURRENCY_CODES[0],
      notes: '',
    },
  })

  useEffect(() => {
    if (isEditMode && cart) {
      reset({
        name: cart.name ?? '',
        currencyCode: cart.currencyCode,
        notes: cart.notes ?? '',
      })
    }
  }, [isEditMode, cart, reset])

  const handleCreateCart = useCallback(
    async (data: CartFormData) => {
      await createCart(
        { data },
        {
          onSuccess: ({ cartId }) => {
            setActiveCartId(cartId)
            notificationAsync(NotificationFeedbackType.Success)
            router.back()
          },
          onError: () => {
            notificationAsync(NotificationFeedbackType.Error)
          },
        },
      )
    },
    [createCart],
  )

  const handleEditCart = useCallback(
    async (data: CartFormData) => {
      if (!cart) {
        return
      }

      await updateCart(
        { cartId: cart.id, data },
        {
          onSuccess: async () => {
            notificationAsync(NotificationFeedbackType.Success)
            await refetch()
            router.back()
          },
          onError: () => {
            notificationAsync(NotificationFeedbackType.Error)
          },
        },
      )
    },
    [cart?.id, updateCart],
  )

  const onSubmit = useMemo(
    () => handleSubmit(isEditMode ? handleEditCart : handleCreateCart),
    [handleSubmit, isEditMode, handleEditCart, handleCreateCart],
  )

  return {
    control,
    onSubmit,
    isSubmitting,
    isLoading,
    isEditMode,
    handlerGoBack: router.back,
  }
}
