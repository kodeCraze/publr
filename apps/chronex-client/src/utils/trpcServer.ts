import 'server-only'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { createTRPCContext } from '@/server/trpc'
import { getQueryClient as makeQueryClient } from '@/app/providers'
import { appRouter } from '@/server/routers/app'
export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})
export const caller = appRouter.createCaller(createTRPCContext)
