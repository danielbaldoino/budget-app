import { VALIDATION } from '@/constants/validation'
import { useActiveCartId } from '@/hooks/use-active-cart'
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
  notes: z.string().optional(),
})

type CartFormData = z.infer<typeof formSchema>

export function useManageCartViewModel() {
  const { mode, cartId } = useLocalSearchParams<{
    mode: 'create' | 'edit'
    cartId?: string
  }>()

  const isEditMode = mode === 'edit'

  const { isLoading, data } = sdk.v1.$reactQuery.useGetCart(
    { cartId: cartId ?? '' },
    { query: { enabled: isEditMode && !!cartId } },
  )

  const cart = data?.cart

  const { mutateAsync: createCart } = sdk.v1.$reactQuery.useCreateCart()
  const { mutateAsync: updateCart } = sdk.v1.$reactQuery.useUpdateCart()

  const [_, setActiveCartId] = useActiveCartId()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CartFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (isEditMode && cart) {
      reset({
        name: cart.name ?? '',
        notes: cart.notes ?? '',
      })
    }
  }, [isEditMode, cart, reset])

  const handleCreateCart = useCallback(
    async (formData: CartFormData) => {
      await createCart(
        { data: { ...formData, currencyCode: 'BRL' } },
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
    async (formData: CartFormData) => {
      if (!cartId) {
        return
      }

      await updateCart(
        { cartId, data: formData },
        {
          onSuccess: () => {
            notificationAsync(NotificationFeedbackType.Success)
            router.back()
          },
          onError: () => {
            notificationAsync(NotificationFeedbackType.Error)
          },
        },
      )
    },
    [cartId, updateCart],
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
