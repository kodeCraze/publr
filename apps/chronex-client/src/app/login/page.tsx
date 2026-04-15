'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/utils/authClient'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { FaGoogle } from 'react-icons/fa'
import { getErrorMessage } from '@/lib/client-errors'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [isLoginPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isSessionPending && session?.user && !isLoginPending) {
      toast.warning('You are already logged in')
      router.replace('/home')
    }
  }, [session, isSessionPending, isLoginPending, router])
  const handleLogin = (value: 'google') => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: value,
          callbackURL: '/home',
        })
      } catch (err) {
        console.error(err)
        toast.error(getErrorMessage(err, 'Login failed'))
      }
    })
  }

  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="text-primary" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="orb-1 pointer-events-none absolute rounded-full"
        style={{
          top: '10%',
          left: '15%',
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, hsl(var(--primary)/0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="orb-2 pointer-events-none absolute rounded-full"
        style={{
          bottom: '5%',
          right: '10%',
          width: 560,
          height: 560,
          background: 'radial-gradient(circle, hsl(var(--secondary)/0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="orb-3 pointer-events-none absolute rounded-full"
        style={{
          top: '50%',
          left: '55%',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, hsl(var(--primary)/0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 0,
          right: '28%',
          width: 1,
          height: '100vh',
          background:
            'linear-gradient(to bottom, transparent, hsl(var(--primary)/0.15) 30%, hsl(var(--primary)/0.08) 70%, transparent)',
          transform: 'rotate(12deg) translateX(40px)',
          transformOrigin: 'top center',
        }}
      />

      {}
      <div className="relative z-10 w-full max-w-sm">
        {}
        <div className="card-fade card-fade-2 rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-2xl">
          {}
          <div className="card-fade card-fade-3 mb-8">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-card-foreground">
              Welcome back
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to continue scheduling your content across all platforms.
            </p>
          </div>

          {}
          <div className="card-fade card-fade-4 flex flex-col gap-3">
            {}
            <Button
              variant="outline"
              className="login-btn w-full cursor-pointer gap-2.5"
              onClick={() => handleLogin('google')}
              disabled={isLoginPending}
            >
              {isLoginPending ? (
                <Spinner />
              ) : (
                <>
                  <FaGoogle size={14} /> Continue with Google
                </>
              )}
            </Button>
          </div>
        </div>

        {}
        <p className="card-fade card-fade-5 mt-10 text-center text-xs text-muted-foreground/50">
          By signing in, you agree to our{' '}
          <Link
            href="/terms-and-conditions"
            className="text-primary/60 transition-colors hover:text-primary"
          >
            Terms
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            className="text-primary/60 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
