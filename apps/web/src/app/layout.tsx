import '@workspace/ui/globals.css'
import { Providers } from '@/components/providers'
import { cn } from '@workspace/ui/lib/utils'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Budget App',
    template: '%s | Budget App',
  },
  icons: {
    icon: [
      { url: '/logo-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/logo-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          'font-sans antialiased',
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
