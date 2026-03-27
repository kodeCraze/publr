'use client'

import { trpc } from '@/utils/trpc'
import OauthCard from '@/components/OauthCard'
import type { PlatformId } from '@/config/platforms'
import { redirect } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { ShieldCheck } from 'lucide-react'

const ALL_PLATFORMS: PlatformId[] = ['instagram', 'threads', 'linkedin', 'discord', 'slack']

export default function ConnectionsPage() {
  const { data: user, isLoading } = trpc.user.getUser.useQuery()

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-8">
        <Spinner />
      </div>
    )
  }

  if (user?.workspaces.length === 0) {
    redirect('/workspace')
  }

  const connectedPlatforms = new Set(user?.authTokens.map((t) => t.platform))
  const connectedCount = ALL_PLATFORMS.filter((p) => connectedPlatforms.has(p)).length

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 rounded-xl border border-border/70 bg-card px-5 py-4">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Connections
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Connected Platforms</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {connectedCount} of {ALL_PLATFORMS.length} platforms connected
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ALL_PLATFORMS.map((platform) => {
          const token = user?.authTokens.find((t) => t.platform === platform)
          return (
            <OauthCard
              key={platform}
              platformname={platform}
              isVerified={connectedPlatforms.has(platform)}
              username={token?.profileName ?? ''}
            />
          )
        })}
      </div>
    </div>
  )
}
