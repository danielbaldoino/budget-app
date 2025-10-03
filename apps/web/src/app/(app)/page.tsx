import { sdk } from '@/lib/sdk'
import { ArrowRight, Building2, UserCog, Wallet } from 'lucide-react'
import Link from 'next/link'

export default async function Page() {
  const { data } = await sdk.getOwnedWorkspace()

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-bold text-lg">Welcome to Budget App!</h1>
        <h1 className="text-foreground/60 text-sm">
          Manage your budget with ease and efficiency.
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href={
            data?.workspace ? '/workspace/settings' : '/onboarding/workspace'
          }
        >
          <div className="flex h-full flex-col gap-4 rounded-lg border bg-border-border p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
              <Building2 className="size-4 text-background" />
            </div>

            <div className="flex flex-1 flex-col text-sm">
              <div className="font-medium">
                {data?.workspace ? 'Manage Workspace' : 'Create Workspace'}
              </div>
              <div>Access and personalize the settings of your workspace</div>
            </div>

            <ArrowRight className="size-4 text-foreground/60" />
          </div>
        </Link>

        <Link href="/billing">
          <div className="flex h-full flex-col gap-4 rounded-lg border bg-border-border p-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
              <Wallet className="size-4 text-background" />
            </div>

            <div className="flex flex-1 flex-col text-sm">
              <div className="font-medium">Billing and Subscriptions</div>
              <div>
                Manage your subscription, track payments and update your plan as
                needed.
              </div>
            </div>

            <ArrowRight className="size-4 text-foreground/60" />
          </div>
        </Link>
      </div>

      {data?.workspace?.active && (
        <>
          <div>
            <h1 className="font-bold text-lg">Your Workspace</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/employees">
              <div className="flex h-full flex-col gap-4 rounded-lg border bg-border-border p-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
                  <UserCog className="size-4 text-background" />
                </div>

                <div className="flex flex-1 flex-col text-sm">
                  <div className="font-medium">Employee registration</div>
                  <div>Manage employee access and information.</div>
                </div>

                <ArrowRight className="size-4 text-foreground/60" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
