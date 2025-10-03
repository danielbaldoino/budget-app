import { sdk } from '@/lib/sdk'
import { Building2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { CreateWorkspaceForm } from './_components/create-workspace-form'

export default async function Page() {
  const { data } = await sdk.getOwnedWorkspace()

  if (data?.workspace) {
    redirect('/workspace/settings')
  }

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Workspace</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-stretch justify-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-border">
              <Building2 className="size-6" />
            </div>

            <h1 className="text-center font-bold text-lg">
              Create a workspace
            </h1>
          </div>

          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  )
}
