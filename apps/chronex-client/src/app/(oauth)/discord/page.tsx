/* eslint-disable react-hooks/error-boundaries */
import { redirect } from "next/navigation"
import { getCaller } from "@/utils/trpcServer"

type PageProps = {
  searchParams: Promise<{
    guild_id?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { guild_id } = await searchParams

  if (!guild_id) redirect("/oauth")

  try {
    const caller = await getCaller()
    await caller.oauthRouter.discord({ guild_id })
    return <div>Authorization successful. You can close this tab.</div>
  } catch (error) {
    console.error("Discord OAuth error:", error)
    return <div>Authorization failed. Please try again.</div>
  }

}