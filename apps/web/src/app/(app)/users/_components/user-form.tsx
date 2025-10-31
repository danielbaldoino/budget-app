'use client'

import { sdk } from '@/lib/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form'
import { Input } from '@workspace/ui/components/input'
import { createSlug } from '@workspace/utils'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { User } from '../_lib/utils'

const formSchema = z.object({
  name: z.string().trim().min(3).max(255),
  username: z.string().trim().min(3).max(30),
  password: z.string().min(6).max(100),
})

export function UserForm({
  user,
}: {
  user?: User
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await sdk.createUser({
      data: values,
    })

    if (error) {
      toast.error(error.message)
    } else {
      form.reset()
      ref.current?.click()
      toast.success('User created successfully')
      router.refresh()
    }
  }

  React.useEffect(() => {
    form.setValue('username', createSlug(form.getValues('name')))
  }, [form.watch('name')])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => form.reset()}>Create User</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new user.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <DialogClose asChild>
            <div ref={ref} className="sr-only" />
          </DialogClose>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col items-stretch justify-center gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="johndoe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Create User
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
