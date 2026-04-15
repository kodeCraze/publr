'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Clock3, Plus, Rocket, Send, Wifi } from 'lucide-react'
import { trpc } from '@/utils/trpc'
import { authClient } from '@/utils/authClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { isPlatformEnabled } from '@/lib/platformAvailability'
import type { PlatformId } from '@/config/platforms'

const ALL_PLATFORMS: PlatformId[] = [
  'instagram',
  'threads',
  'linkedin',
  'discord',
  'slack',
  'telegram',
]

function getGreeting(name?: string | null) {
  const hour = new Date().getHours()
  const firstName = name?.trim().split(' ')[0] ?? 'there'

  if (hour < 12) return `Good morning, ${firstName}`
  if (hour < 18) return `Good afternoon, ${firstName}`
  return `Good evening, ${firstName}`
}

function getClientCookie(name: string) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null
  return null
}

export default function UserHomePage() {
  const { data: session } = authClient.useSession()

  const [workspaceIdReady, setWorkspaceIdReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const check = () => {
      const storedLs = typeof window !== 'undefined' ? localStorage.getItem('workspaceId') : null
      const storedCookie = getClientCookie('workspaceId')
      const ready = Boolean(storedLs || storedCookie)
      if (mounted) setWorkspaceIdReady(ready)
      return ready
    }

    if (check()) return () => {}

    const timer = window.setInterval(() => {
      if (check()) {
        window.clearInterval(timer)
      }
    }, 300)

    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  const { data: user, isLoading: isUserLoading } = trpc.user.getUser.useQuery(undefined, {
    enabled: workspaceIdReady,
    retry: false,
  })
  const { data: postsData, isLoading: isPostsLoading } = trpc.post.getUserPosts.useQuery(
    {
      page: 1,
      pageSize: 20,
    },
    {
      enabled: workspaceIdReady,
      retry: false,
    },
  )

  const stats = useMemo(() => {
    const items = postsData?.items ?? []

    const queuedCount = items.filter((item) =>
      ['scheduled', 'pending', 'queued'].includes(item.status.toLowerCase()),
    ).length
    const publishedCount = items.filter((item) =>
      ['published', 'success', 'sent'].includes(item.status.toLowerCase()),
    ).length
    const connectedCount = (() => {
      const enabledPlatforms = ALL_PLATFORMS.filter((platform) => isPlatformEnabled(platform))
      const authTokens = user?.authTokens ?? []
      const telegramChannelCount = user?.telegramChannelCount ?? 0
      const connectedPlatforms = new Set(
        authTokens
          .filter((token) => isPlatformEnabled(token.platform as PlatformId))
          .filter((token) => token.platform !== 'telegram' || telegramChannelCount > 0)
          .map((token) => token.platform as PlatformId),
      )

      return enabledPlatforms.filter((platform) => connectedPlatforms.has(platform)).length
    })()

    return {
      queuedCount,
      publishedCount,
      connectedCount,
      totalPosts: postsData?.totalItems ?? 0,
    }
  }, [postsData, user])

  const isLoading = isUserLoading || isPostsLoading

  if (!workspaceIdReady) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner />
          <p className="text-sm text-muted-foreground">Setting up your workspace...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">
            {getGreeting(session?.user?.name ?? user?.name)}
          </CardTitle>
          <CardDescription>
            This is your workspace home. Track content health, jump into your next task, and keep
            publishing momentum.
          </CardDescription>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-2">
              <Clock3 className="size-4" />
              In queue
            </CardDescription>
            <CardTitle className="text-3xl">{stats.queuedCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Posts waiting to be published.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-2">
              <Send className="size-4" />
              Published
            </CardDescription>
            <CardTitle className="text-3xl">{stats.publishedCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Recent posts delivered successfully.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="inline-flex items-center gap-2">
              <Wifi className="size-4" />
              Connected channels
            </CardDescription>
            <CardTitle className="text-3xl">{stats.connectedCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Active platforms ready for publishing.
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Start fast with the things you do most.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/post/createPost">
              <Plus data-icon="inline-start" />
              Create post
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tokens">Connect platforms</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/post">
              <Rocket data-icon="inline-start" />
              View scheduled posts
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity snapshot</CardTitle>
          <CardDescription>
            You have {stats.totalPosts} total post{stats.totalPosts === 1 ? '' : 's'} in this
            workspace.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
