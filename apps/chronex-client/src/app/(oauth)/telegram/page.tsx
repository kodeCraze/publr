import Link from 'next/link'
import { caller } from '@/utils/trpcServer'

export const dynamic = 'force-dynamic'

export default async function TelegramConnectPage() {
  let botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'bot'
  let registrationCode = ''
  let hasError = false

  try {
    const result = await caller.oauthRouter.telegram()

    botUsername = result.botUsername || botUsername
    registrationCode = result.registrationCode
  } catch (error) {
    console.error('Telegram connect error:', error)
    hasError = true
  }

  if (hasError) {
    return <div>Telegram connection failed. Please try again.</div>
  }

  const addBotToGroupUrl = `https://t.me/${botUsername}?startgroup=chronex_${registrationCode}`
  const addBotToChannelUrl = `https://t.me/${botUsername}?startchannel&admin=post_messages`

  return (
    <main className="mx-auto max-w-xl space-y-4 px-6 py-8 text-sm">
      <h1 className="text-xl font-semibold">Telegram setup started</h1>
      <p>
        Finish setup with <strong>@{botUsername}</strong> in the Telegram destination you want to
        use.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          For groups, use the group button below. For channels, use the channel button below and add
          the bot as an admin.
        </li>
        <li>
          In the target chat, send{' '}
          <code className="rounded bg-muted px-2 py-1">/connect {registrationCode}</code>
        </li>
      </ol>
      <p className="text-muted-foreground">
        Sending the code in a private chat with the bot will not connect the workspace.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={addBotToGroupUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-4"
        >
          Add bot to group
        </Link>
        <Link
          href={addBotToChannelUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-4"
        >
          Add bot to channel
        </Link>
      </div>
      <p>Refresh Chronex after the bot confirms.</p>
    </main>
  )
}
