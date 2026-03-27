'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CalendarClock, LogOut, Mail, User2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/utils/authClient'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  if (isPending) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner className="size-5 text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Not signed in</CardTitle>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>
              Go back
            </Button>
            <Button className="flex-1" onClick={() => router.push('/login')}>
              Sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const initials =
    user.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U'

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      {/* Identity card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Name + badge */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {user.name ?? 'Unknown user'}
                </h1>
                <Badge variant="secondary">Owner</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">Active session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pb-4">
          <Row icon={Mail} label="Email" value={user.email ?? '—'} />
          <Separator className="my-1" />
          <Row icon={User2} label="Name" value={user.name ?? '—'} />
          <Separator className="my-1" />
          <Row icon={CalendarClock} label="Session" value="Active now" />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => router.push('/post')}>
          Dashboard
        </Button>
        <Button variant="default" className="flex-1" onClick={() => router.push('/signout')}>
          <LogOut className="mr-2 size-4" />
          Sign out
        </Button>
      </div>
    </main>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md px-1 py-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-20 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  )
}
