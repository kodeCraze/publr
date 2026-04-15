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
  { title: 'Scheduled Posts', url: '/post', icon: PenSquare },
  { title: 'Create Post', url: '/post/createPost', icon: PlusSquare },
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
    <Sidebar>
      <SidebarHeader>
        <Workspace />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={activeUrl === item.url}>
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
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {authNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={activeUrl === item.url}>
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
