"use client"
import { trpc } from "@/utils/trpc"
import { redirect, useSearchParams } from "next/navigation"
import { useState } from "react"
const Page = () => {
  const searchParams = useSearchParams()
const code = searchParams.get("code")
const authorize = trpc.oauthRouter.instagram.useMutation()
const [status, setStatus] = useState("Authorizing...")
  if(code){
    authorize.mutate({code},{
      onSuccess: (data) => {
        console.log("Instagram OAuth successful:", data)
        setStatus("Authorization successful! You can close this window.")
        redirect("/")
      },
      onError: (error) => {
        console.error("Instagram OAuth error:", error)
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