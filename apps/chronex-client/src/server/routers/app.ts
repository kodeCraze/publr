import { createTRPCRouter } from '../trpc'
import { oauthRouter } from './oauth'
import { postRouter } from './post'
import workspaceRouter from './workspace'
import { userRouter } from './user'
import { disconnectRouter } from './deOauth'

export const appRouter = createTRPCRouter({
  oauthRouter: oauthRouter,
  post: postRouter,
  workspace: workspaceRouter,
  user: userRouter,
  disconnect: disconnectRouter,
})

export type AppRouter = typeof appRouter
