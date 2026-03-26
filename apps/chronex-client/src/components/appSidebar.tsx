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
import { Home, PenSquare, Image as ImageIcon, Key, LogOut, LogIn, PlusSquare } from 'lucide-react'
import Workspace from './workspace'

const mainNavItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Posts', url: '/post', icon: PenSquare },
  { title: 'Create Post', url: '/post/createPost', icon: PlusSquare },
  { title: 'Media', url: '/media', icon: ImageIcon },
  { title: 'Tokens', url: '/tokens', icon: Key },
]

const authNavItems = [
  { title: 'Login', url: '/login', icon: LogIn },
  { title: 'Sign Out', url: '/signout', icon: LogOut },
]

export function AppSidebar() {
  const pathname = usePathname()

  const checkIsActive = (url: string) => {
    if (url === '/') {
      return pathname === url
    }
    return pathname?.startsWith(url)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-4 py-3">
          <span className="font-geist-sans text-xl font-bold tracking-tight">Chronex</span>
        </div>
        <Workspace />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={checkIsActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={checkIsActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
