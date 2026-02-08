import { VALIDATION } from '@/constants/validation'
import { useSession } from '@/hooks/use-session'
import { i18n } from '@/lib/languages'
import { sdk } from '@/lib/sdk'
import { useWorkspaceStore } from '@/store/workspace-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  username: z
    .string()
    .min(
      VALIDATION.MIN_INPUT_LENGTH,
      i18n.t('signIn.username.validation.required'),
    ),
  password: z
    .string()
    .min(
      VALIDATION.MIN_INPUT_LENGTH,
      i18n.t('signIn.password.validation.required'),
    ),
  workspaceId: z
    .string()
    .min(
      VALIDATION.MIN_INPUT_LENGTH,
      i18n.t('signIn.workspaceId.validation.required'),
    ),
})

type SignInFormData = z.infer<typeof formSchema>

// Only use default values in development for testing
const getDefaultValues = (
  workspaceId: string | null,
): Partial<SignInFormData> => {
  const defaults: Partial<SignInFormData> = {
    workspaceId: workspaceId ?? undefined,
  }

  if (__DEV__) {
    defaults.username = 'john-doe'
    defaults.password = 'securepassword'
  }

  return defaults
}

export function useSignInViewModel() {
  const { workspaceId, setWorkspaceId } = useWorkspaceStore()
  const { signIn } = useSession()
  const { mutateAsync } = sdk.v1.$reactQuery.useLogIn()
  const [signInError, setSignInError] = useState<string | undefined>()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(workspaceId),
  })

  const handleSignIn = useCallback(
    async (values: SignInFormData) => {
      const { workspaceId: formWorkspaceId, ...credentials } = values

      setWorkspaceId(formWorkspaceId)
      setSignInError(undefined)

      await mutateAsync(
        { data: credentials },
        {
          onSuccess: ({ token }) => {
            notificationAsync(NotificationFeedbackType.Success)
            signIn(token)
          },
          onError: ({ message }) => {
            notificationAsync(NotificationFeedbackType.Error)
            setSignInError(message)
          },
        },
      )
    },
    [mutateAsync, setWorkspaceId, signIn],
  )

  return {
    control,
    onSubmit: handleSubmit(handleSignIn),
    isSubmitting,
    signInError,
  }
}
