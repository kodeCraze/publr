import { pgEnum } from 'drizzle-orm/pg-core'

export const postStatusEnum = pgEnum('post_status', [
  'scheduled',
  'published',
  'publishing',
  'failed',
])

export const platformPostStatusEnum = pgEnum('platform_post_status', [
  'pending',
  'processing',
  'published',
  'failed',
])

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video'])

export const platformEnum = pgEnum('platform', [
  'linkedin',
  'instagram',
  'threads',
  'slack',
  'discord',
  'telegram',
])
