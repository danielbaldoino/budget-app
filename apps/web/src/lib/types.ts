export type Workspace = {
  id: string
  active: boolean
  name: string
  slug: string
  logoUrl: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}
