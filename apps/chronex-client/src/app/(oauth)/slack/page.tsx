import { redirect } from 'next/navigation'
import { getCaller } from '@/utils/trpcServer'

type PageProps = {
  searchParams: Promise<{
    code?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { code } = await searchParams

  if (!code) redirect('/oauth')

  let isAuthorized = false

  try {
    const caller = await getCaller()
    await caller.oauthRouter.slack({ code })
    isAuthorized = true
  } catch (error) {
    console.error('Slack OAuth error:', error)
  }

  return (
    <div>
      {isAuthorized
        ? 'Authorization successful. You can close this tab.'
        : 'Authorization failed. Please try again.'}
    </div>
  )
}
