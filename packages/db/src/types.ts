import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { workspace } from './schema/workspace'
import { authToken } from './schema/auth-token'
import { post, postMedia } from './schema/posts'
import { platformPosts } from './schema/platform-posts'

export type Workspace = InferSelectModel<typeof workspace>
export type NewWorkspace = InferInsertModel<typeof workspace>

export type AuthToken = InferSelectModel<typeof authToken>
export type NewAuthToken = InferInsertModel<typeof authToken>

export type Post = InferSelectModel<typeof post>
export type NewPost = InferInsertModel<typeof post>

export type PostMedia = InferSelectModel<typeof postMedia>
export type NewPostMedia = InferInsertModel<typeof postMedia>

export type PlatformPost = InferSelectModel<typeof platformPosts>
export type NewPlatformPost = InferInsertModel<typeof platformPosts>
