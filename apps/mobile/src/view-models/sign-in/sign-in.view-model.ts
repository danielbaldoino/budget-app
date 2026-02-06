import { useSession } from '@/hooks/use-session'
import { sdk } from '@/lib/sdk'
import { useWorkspaceStore } from '@/store/workspace-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { NotificationFeedbackType, notificationAsync } from 'expo-haptics'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  username: z.string().min(3, 'Nome de usuário é obrigatório.'),
  password: z.string().min(3, 'Senha é obrigatória.'),
  workspaceId: z.string().min(3, 'ID do workspace é obrigatório.'),
})

export function useSignInViewModel() {
  const { workspaceId, setWorkspaceId } = useWorkspaceStore()
  const { logIn } = useSession()
  const { mutateAsync } = sdk.v1.$reactQuery.useLogIn()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'john-doe',
      password: 'securepassword',
      workspaceId: workspaceId ?? undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { workspaceId, ...data } = values

    setWorkspaceId(workspaceId)

    setErrorMessage(undefined)

    await mutateAsync(
      { data },
      {
        onSuccess: ({ token }) => {
          notificationAsync(NotificationFeedbackType.Success)
          logIn({ token })
        },
        onError: ({ message }) => {
          notificationAsync(NotificationFeedbackType.Error)
          setErrorMessage(message)
        },
      },
    )
  }

  return {
    form,
    onSubmit,
    errorMessage,
  }
}
