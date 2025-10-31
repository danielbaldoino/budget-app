'use client'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { CopyIcon } from 'lucide-react'

export function ViewWorkspaceSlug({ slug }: { slug: string }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
        <div className="flex flex-col space-y-3">
          <h2 className="font-medium text-xl">Workspace Slug</h2>
          <p className="text-muted-foreground text-sm">
            The unique slug identifier for your workspace.
          </p>
        </div>
        <div className="relative w-full max-w-md">
          <Input className="pe-9" defaultValue={slug} readOnly />
          <Button
            variant="ghost"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-1 size-7"
            onClick={async () => {
              await navigator.clipboard.writeText(slug)
            }}
          >
            <CopyIcon className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
