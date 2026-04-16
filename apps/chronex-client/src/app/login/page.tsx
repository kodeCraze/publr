'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/utils/authClient'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition, useState, useCallback } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { FaGoogle } from 'react-icons/fa'
import { getErrorMessage } from '@/lib/client-errors'
import Link from 'next/link'
import { BrandName } from '@/components/logo/brandName'
import { BetaBadge } from '@/components/BetaBadge'
import { ThemeToggle } from '@/components/themeToggle'
import { ArrowLeft } from 'lucide-react'

// ---------------------------------------------------------------------------
// Rotating motivational messages shown inside the card
// ---------------------------------------------------------------------------
const LOGIN_MESSAGES = [
  {
    heading: 'Your audience\nis waiting.',
    sub: 'Sign in and start scheduling your next big post.',
  },
  {
    heading: 'One dashboard.\nAll platforms.',
    sub: 'Stop switching tabs — Publr keeps everything in one place.',
  },
  {
    heading: 'Consistency\nbuilds audiences.',
    sub: 'Sign in and never miss a posting window again.',
  },
  {
    heading: 'Schedule while\nyou sleep.',
    sub: 'Wake up to posts already live across every platform.',
  },
  {
    heading: 'Your content.\nYour calendar.',
    sub: 'Take full control of your publishing flow today.',
  },
] as const

/** How long each message is shown (ms) before fading to the next */
const CYCLE_MS = 4_500
/** Fade-out duration (ms) — must match the CSS transition below */
const FADE_OUT_MS = 320

export default function LoginPage() {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const [isLoginPending, startTransition] = useTransition()

  // ── Rotating message state ──────────────────────────────────────────────
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // ── Redirect already-authenticated users ────────────────────────────────
  useEffect(() => {
    if (!isSessionPending && session?.user && !isLoginPending) {
      toast.warning('You are already signed in.')
      router.replace('/home')
    }
  }, [session, isSessionPending, isLoginPending, router])

  // ── Cycle messages with a cross-fade ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      // 1) fade out
      setVisible(false)
      // 2) swap text after the fade-out completes, then fade in
      const swap = setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % LOGIN_MESSAGES.length)
        setVisible(true)
      }, FADE_OUT_MS)
      return () => clearTimeout(swap)
    }, CYCLE_MS)

    return () => clearInterval(interval)
  }, [])

  // ── OAuth sign-in handler ────────────────────────────────────────────────
  const handleLogin = useCallback((provider: 'google') => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider,
          callbackURL: '/home',
        })
      } catch (err) {
        console.error('[Login error]', err)

        // Surface popup-blocked errors with a more actionable message
        const raw = err instanceof Error ? err.message.toLowerCase() : `${err}`.toLowerCase()
        if (raw.includes('popup') || raw.includes('blocked')) {
          toast.error('Pop-up blocked. Please allow pop-ups for this site and try again.')
        } else if (raw.includes('network') || raw.includes('fetch')) {
          toast.error('Network error. Check your connection and try again.')
        } else {
          toast.error(getErrorMessage(err, 'Sign-in failed. Please try again.'))
        }
      }
    })
  }, [])

  // ── Full-screen loader while session hydrates ────────────────────────────
  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="text-primary" />
      </div>
    )
  }

  const msg = LOGIN_MESSAGES[msgIndex]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      {/* ── Ambient background orbs ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute rounded-full"
          style={{
            top: '8%',
            left: '12%',
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, hsl(var(--primary)/0.10) 0%, transparent 70%)',
            filter: 'blur(64px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '4%',
            right: '8%',
            width: 580,
            height: 580,
            background: 'radial-gradient(circle, hsl(var(--secondary)/0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: '48%',
            left: '52%',
            width: 320,
            height: 320,
            background: 'radial-gradient(circle, hsl(var(--primary)/0.05) 0%, transparent 70%)',
            filter: 'blur(52px)',
          }}
        />
        {/* Decorative angled line */}
        <div
          className="absolute"
          style={{
            top: 0,
            right: '30%',
            width: 1,
            height: '100vh',
            background:
              'linear-gradient(to bottom, transparent, hsl(var(--primary)/0.13) 30%, hsl(var(--primary)/0.07) 70%, transparent)',
            transform: 'rotate(12deg) translateX(40px)',
            transformOrigin: 'top center',
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex h-14 shrink-0 items-center px-4 sm:px-6">
        {/* Left — back to home */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </Button>

        {/* Center — brand (absolutely centred so it doesn't shift with side items) */}
        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Publr – back to home"
        >
          <BrandName />
          <BetaBadge />
        </Link>

        {/* Right — theme toggle */}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-2xl">
            {/* Dynamic heading + sub — fixed height prevents card resize */}
            <div className="mb-8" style={{ minHeight: '6.5rem' }}>
              <h1
                className="mb-2 text-2xl font-semibold tracking-tight whitespace-pre-line text-card-foreground"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0px)' : 'translateY(5px)',
                  transition: `opacity ${FADE_OUT_MS}ms ease, transform ${FADE_OUT_MS}ms ease`,
                }}
              >
                {msg.heading}
              </h1>
              <p
                className="text-sm leading-relaxed text-muted-foreground"
                style={{
                  opacity: visible ? 1 : 0,
                  transition: `opacity ${FADE_OUT_MS}ms ease`,
                  transitionDelay: visible ? '40ms' : '0ms',
                }}
              >
                {msg.sub}
              </p>
            </div>

            {/* Subtle message-progress dots */}
            <div className="mb-6 flex items-center gap-1.5" aria-hidden>
              {LOGIN_MESSAGES.map((_, i) => (
                <span
                  key={i}
                  className="inline-block rounded-full transition-all duration-500"
                  style={{
                    width: i === msgIndex ? 16 : 4,
                    height: 4,
                    background:
                      i === msgIndex ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.25)',
                  }}
                />
              ))}
            </div>

            {/* OAuth buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full cursor-pointer gap-2.5"
                onClick={() => handleLogin('google')}
                disabled={isLoginPending}
                aria-busy={isLoginPending}
              >
                {isLoginPending ? (
                  <>
                    <Spinner className="size-4" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <FaGoogle size={14} />
                    Continue with Google
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Legal footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground/50">
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
      </main>
    </div>
  )
}
