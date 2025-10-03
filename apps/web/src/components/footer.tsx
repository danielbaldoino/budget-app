import { Separator } from '@workspace/ui/components/separator'

export async function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center">
      <Separator />

      <div className="flex w-full max-w-6xl flex-1 items-center justify-between gap-4 p-4">
        <div className="text-muted-foreground">
          <span className="text-sm">
            © {new Date().getFullYear()} Budget App. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
