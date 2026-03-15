"use client"
import { trpc } from "@/utils/trpc"
import { redirect, useSearchParams } from "next/navigation"
import { useState } from "react"
const Page = () => {
  const searchParams = useSearchParams()
const guildId = searchParams.get("guild_id")
const authorize = trpc.oauthRouter.discord.useMutation()
const [status, setStatus] = useState("Authorizing...")
  if(guildId){
    authorize.mutate({guild_id: guildId},{
      onSuccess: (data) => {
        console.log("Discord OAuth successful:", data)
        setStatus("Authorization successful! You can close this window.")
        redirect("/")
      },
      onError: (error) => {
        console.error("Discord OAuth error:", error)
        setStatus("Authorization failed. Please try again.")
        redirect("/oauth")
      },
    })
  }
  return (
    <div>
      <p>{status}</p>
    </div>
  )
}

export default Page