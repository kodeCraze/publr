import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/appSidebar'

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  )
}
