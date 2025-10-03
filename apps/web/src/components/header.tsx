import { authenticatedUser } from '@/lib/auth/server'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { Separator } from '@workspace/ui/components/separator'
import { ChevronDown, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { SignOutLink } from './auth/sign-out-link'
import { Logo } from './logo'
import { ThemeSwitcher } from './theme-switcher'

export async function Header() {
  const { user } = await authenticatedUser()

  return (
    <header className="sticky top-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
      <div className="flex w-full max-w-6xl flex-1 items-center justify-between gap-4 px-4 py-2">
        <Link href="/">
          <Logo className="size-10 min-w-max rounded-sm" />
        </Link>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-6"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 outline-none"
              >
                <div className="flex flex-col items-end">
                  <span className="font-medium text-xs">{user.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {user.email}
                  </span>
                </div>
                <Avatar className="size-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />

                  <AvatarFallback>
                    {user
                      .name!.split(' ')
                      .map((word) => word.charAt(0).toUpperCase())
                      .slice(0, 2)
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/account/settings">
                  <User className="size-4" /> Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutLink>
                  <LogOut className="size-4" /> Sign out
                </SignOutLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />
    </header>
  )
}
