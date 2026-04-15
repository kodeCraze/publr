import type { PlatformId } from '@/config/platforms'

const BLACKLIST = new Set(
  (process.env.NEXT_PUBLIC_PLATFORM_BLACKLIST ?? '')
    .split(',')
    .map((platform) => platform.trim().toLowerCase())
    .filter(Boolean),
)

export function isPlatformEnabled(platform: PlatformId): boolean {
  return !BLACKLIST.has(platform)
}

export function filterEnabledPlatforms<T extends { id: PlatformId }>(platforms: T[]): T[] {
  return platforms.filter((platform) => isPlatformEnabled(platform.id))
}
