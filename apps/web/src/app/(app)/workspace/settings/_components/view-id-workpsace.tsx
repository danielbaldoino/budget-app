'use client'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { CopyIcon } from 'lucide-react'
import Link from 'next/link'

export function ViewIdWorkspace({ id }: { id: string }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
        <div className="flex flex-col space-y-3">
          <h2 className="font-medium text-xl">Workspace ID</h2>
          <p className="text-muted-foreground text-sm">
            Unique ID of your workspace in Budget App.
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Input className="pe-9" defaultValue={id} readOnly />
          <Button
            variant="ghost"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-1 size-7"
            onClick={async () => {
              await navigator.clipboard.writeText(id)
            }}
          >
            <CopyIcon className="size-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-start space-x-4 rounded-b-lg border-border border-t bg-foreground/2 p-3 sm:px-10">
        <p className="text-muted-foreground text-sm">
          Used to identify your workspace when interacting with the{' '}
          <Link href="/docs" target="_blank" className="underline">
            API of Budget App
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
