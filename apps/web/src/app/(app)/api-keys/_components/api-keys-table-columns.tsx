'use client'

import type { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { ArrowUpDown, Copy, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { sdk } from '@/lib/sdk'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog'
import { Button } from '@workspace/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import type { ApiKey } from '../_lib/utils'

export function getApiKeysTableColumns(): ColumnDef<ApiKey>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'token',
      header: 'Token',
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="font-mono text-xs"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(row.getValue('token') as string)
              }}
            >
              {(row.getValue('token') as string).slice(0, 10)}...
              <Copy />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created At
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          {new Date(row.getValue('createdAt') as string).toLocaleDateString(
            'en-US',
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const apiKey = row.original

        const { refresh } = useRouter()

        // const { mutate, isPending } = sdk.$reactQuery.useDeleteApiKey({
        //   mutation: {
        //     onSuccess: () => {
        //       refresh()
        //       toast.success('API key deleted successfully')
        //     },
        //     onError: (error) => {
        //       toast.error(error.message)
        //     },
        //   },
        // })

        const onDelete = async () => {
          // mutate({ apiKeyId: apiKey.id })

          try {
            await sdk.deleteApiKey({ apiKeyId: apiKey.id })
            refresh()
            toast.success('API key deleted successfully')
          } catch (error: any) {
            toast.error(error.message)
          }
        }

        return (
          <AlertDialog>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(apiKey.id)}
                >
                  Copy API key ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    // disabled={isPending}
                  >
                    Delete API key
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  user account and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  // disabled={isPending}
                  onClick={onDelete}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      },
    },
  ]
}
