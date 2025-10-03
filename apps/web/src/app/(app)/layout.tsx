import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh flex-col items-stretch justify-center">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        {children}
      </main>

      <Footer />
    </div>
  )
}
