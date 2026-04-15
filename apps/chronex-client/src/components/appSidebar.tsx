'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  PenSquare,
  Image as ImageIcon,
  Key,
  LogOut,
  LogIn,
  PlusSquare,
  Briefcase,
} from 'lucide-react'
import Workspace from './workspace'
import { authClient } from '@/utils/authClient'

const mainNavItems = [
  { title: 'Home', url: '/home', icon: Home },
  { title: 'Scheduled Content', url: '/post', icon: PenSquare },
  { title: 'Create Content', url: '/post/createPost', icon: PlusSquare },
  { title: 'Media Library', url: '/media', icon: ImageIcon },
  { title: 'Connected Accounts', url: '/tokens', icon: Key },
  { title: 'Workspace', url: '/workspace', icon: Briefcase },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const authNavItems = isPending
    ? []
    : user
      ? [{ title: 'Sign Out', url: '/signout', icon: LogOut }]
      : [{ title: 'Login', url: '/login', icon: LogIn }]

  const getBestActiveUrl = (urls: string[]) => {
    if (!pathname) return null

    const matches = urls.filter((url) => {
      if (url === '/') return pathname === '/'
      return pathname === url || pathname.startsWith(`${url}/`)
    })

    if (matches.length === 0) return null

    return matches.sort((a, b) => b.length - a.length)[0]
  }

  const activeUrl = getBestActiveUrl([...mainNavItems, ...authNavItems].map((item) => item.url))

  return (
    <Sidebar className="border-r border-sidebar-border/70">
      <SidebarHeader className="px-2 py-2.5">
        <Workspace />
      </SidebarHeader>
      <SidebarContent className="px-2 pb-3">
        <SidebarGroup className="p-1">
          <SidebarGroupLabel className="h-7 px-2 text-[11px] tracking-wide uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeUrl === item.url}
                    className="h-9 rounded-lg px-2.5 text-[13px] font-medium"
                  >
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {authNavItems.length > 0 ? (
          <SidebarGroup className="mt-2 p-1">
            <SidebarGroupLabel className="h-7 px-2 text-[11px] tracking-wide uppercase">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu className="gap-1">
                {authNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeUrl === item.url}
                      className="h-9 rounded-lg px-2.5 text-[13px] font-medium"
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
