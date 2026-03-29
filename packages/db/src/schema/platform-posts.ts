import { pgTable, text, timestamp, index, serial, integer, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { post, postMedia } from './posts'
import { platformPostStatusEnum, platformEnum } from './enums'

export const platformPosts = pgTable(
  'platform_posts',
  {
    id: serial('id').primaryKey(),
    postId: integer('post_id')
      .references(() => post.id, { onDelete: 'cascade' })
      .notNull(),
    platform: platformEnum('platform').notNull(),
    externalId: text('external_id'),
    postUrl: text('post_url'),
    metadata: jsonb('metadata'),
    status: platformPostStatusEnum('status').notNull().default('pending'),
    scheduledAt: timestamp('scheduled_at'),
    publishedAt: timestamp('published_at'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    postIdPlatformIdx: index('platform_posts_post_id_platform_idx').on(
      table.postId,
      table.platform,
    ),
    statusIdx: index('platform_posts_status_idx').on(table.status),
    scheduledAtIdx: index('platform_posts_scheduled_at_idx').on(table.scheduledAt),
  }),
)

export const platformPostsRelations = relations(platformPosts, ({ one }) => ({
  post: one(post, {
    fields: [platformPosts.postId],
    references: [post.id],
  }),
}))
