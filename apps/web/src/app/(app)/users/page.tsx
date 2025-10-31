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
import { UsersTable } from './_components/users-table'

export default async function Page() {
  const { data } = await sdk.listUsers({})

  if (!data) {
    return
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
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 justify-center gap-4">
        <UsersTable data={data.users} />
      </div>
    </div>
  )
}
