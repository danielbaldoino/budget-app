import { useSession } from '@/hooks/use-session'
import { i18n } from '@/lib/languages'
import { sdk } from '@/lib/sdk'
import { useWorkspaceStore } from '@/store/workspace-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  username: z.string().min(3, i18n.t('signIn.username.validation.required')),
  password: z.string().min(3, i18n.t('signIn.password.validation.required')),
  workspaceId: z
    .string()
    .min(3, i18n.t('signIn.workspaceId.validation.required')),
})

const DEFAULT_VALUES = __DEV__
  ? { username: 'john-doe', password: 'securepassword' }
  : {}

export function useSignInViewModel() {
  const { workspaceId, setWorkspaceId } = useWorkspaceStore()
  const { signIn } = useSession()
  const { mutateAsync } = sdk.v1.$reactQuery.useLogIn()
  const [signInError, setSignInError] = useState<string | undefined>()

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      workspaceId: workspaceId ?? undefined,
    },
  })

  const handleSignIn = async (values: z.infer<typeof formSchema>) => {
    const { workspaceId, ...data } = values

    setWorkspaceId(workspaceId)

    setSignInError(undefined)

    await mutateAsync(
      { data },
      {
        onSuccess: ({ token }) => {
          notificationAsync(NotificationFeedbackType.Success)
          signIn({ token })
        },
        onError: ({ message }) => {
          notificationAsync(NotificationFeedbackType.Error)
          setSignInError(message)
        },
      },
    )
  }

  return {
    control,
    onSubmit: handleSubmit(handleSignIn),
    isSubmitting,
    signInError,
  }
}
