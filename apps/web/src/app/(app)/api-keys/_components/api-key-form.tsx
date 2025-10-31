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
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { ApiKey } from '../_lib/utils'

const formSchema = z.object({
  name: z.string().trim().min(3).max(255),
})

export function ApiKeyForm({
  apiKey,
}: {
  apiKey?: ApiKey
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: apiKey?.name || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await sdk.createApiKey({
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => form.reset()}>Create API Key</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the workspace resources.
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
                      <Input {...field} placeholder="My API Key" />
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
                  Create API Key
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
