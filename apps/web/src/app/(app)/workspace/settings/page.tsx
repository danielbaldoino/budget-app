import { sdk } from '@/lib/sdk'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ViewIdWorkspace } from './_components/view-id-workpsace'

export default async function Page() {
  const { data } = await sdk.getOwnedWorkspace()

  if (!data?.workspace) {
    redirect('/onboarding/workspace')
  }

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
      <Breadcrumb>
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
      </Breadcrumb>

      <ViewIdWorkspace id={data.workspace.id} />
    </div>
  )
}
