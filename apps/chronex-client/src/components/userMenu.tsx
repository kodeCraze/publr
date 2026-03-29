import { LogOut, User as UserIcon } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useRouter } from 'next/navigation'

type UserMenuProps = {
  user: {
    name?: string | null
    email?: string | null
  }
  avatar: React.ReactNode
}

export function UserMenu({ user, avatar }: UserMenuProps) {
  const router = useRouter()
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="flex size-9 items-center justify-center rounded-sm border bg-card shadow-sm hover:bg-accent">
          {avatar}
        </button>
      </HoverCardTrigger>

      <HoverCardContent align="end" className="w-56">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{user.name ?? 'Unknown user'}</span>
          <span className="text-xs text-muted-foreground">{user.email ?? 'No email'}</span>
        </div>

        <div className="mt-3 flex flex-col">
          <button
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
            onClick={() => router.push('/profile')}
          >
            <UserIcon size={14} />
            Profile
          </button>

          {}

          <button
            onClick={() => router.push('/signout')}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
