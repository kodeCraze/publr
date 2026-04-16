'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, CalendarClock, Layers3, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandName } from '@/components/logo/brandName'
import { BetaBadge } from '@/components/BetaBadge'
import { ThemeToggle } from '@/components/themeToggle'
import IconRenderer from '@/lib/logoMapping'
import { PlatformId } from '@/config/platforms'
import XLogoIcon from '@/components/logo/x'
import { isPlatformEnabled } from '@/lib/platformAvailability'

const PLATFORMS: Array<{ name: PlatformId; color: string }> = [
  { name: 'instagram', color: '#E1306C' },
  { name: 'threads', color: '#888888' },
  { name: 'linkedin', color: '#0A66C2' },
  { name: 'slack', color: '#E01E5A' },
  { name: 'discord', color: '#5865F2' },
  { name: 'telegram', color: '#0088cc' },
]

const ENABLED_PLATFORMS = PLATFORMS.filter((platform) => isPlatformEnabled(platform.name))
const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: 'Instagram',
  threads: 'Threads',
  linkedin: 'LinkedIn',
  slack: 'Slack',
  discord: 'Discord',
  telegram: 'Telegram',
}
const PLATFORM_CAPABILITY_LABELS: Record<PlatformId, string> = {
  instagram: 'Business posting',
  threads: 'Thread scheduling',
  linkedin: 'Page publishing',
  slack: 'Workspace broadcast',
  discord: 'Channel drops',
  telegram: 'Bot publishing',
}
const TICKER_PX_PER_SECOND = 90

const SCHEDULE = [
  {
    platform: 'Telegram',
    color: '#0088cc',
    time: 'Today  ·  9:00 AM',
    status: 'queued',
    title: 'Morning launch teaser',
  },
  {
    platform: 'LinkedIn',
    color: '#0A66C2',
    time: 'Today  ·  11:30 AM',
    status: 'queued',
    title: 'Founder hot take (clean version)',
  },
  {
    platform: 'Slack',
    color: '#E01E5A',
    time: 'Today  ·  2:00 PM',
    status: 'draft',
    title: 'Team update: wins + blockers',
  },
  {
    platform: 'Discord',
    color: '#5865F2',
    time: 'Yesterday',
    status: 'sent',
    title: 'Community feature roast night',
  },
  {
    platform: 'Telegram',
    color: '#0088cc',
    time: 'Yesterday',
    status: 'sent',
    title: 'Weekly roundup in 5 bullets',
  },
]

const FEATURES = [
  {
    num: '01',
    title: 'Connect once',
    desc: 'Authenticate every channel per workspace and keep credentials organized.',
    icon: ShieldCheck,
  },
  {
    num: '02',
    title: 'Compose centrally',
    desc: 'Build one campaign and tune copy, media, and payload per platform.',
    icon: Layers3,
  },
  {
    num: '03',
    title: 'Schedule reliably',
    desc: 'Queue jobs, monitor status, and keep launch timing completely predictable.',
    icon: CalendarClock,
  },
]

const STATUS_STYLES: Record<string, string> = {
  queued: 'bg-primary/15 text-primary font-semibold',
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-green-500/15 text-green-600 dark:text-green-400 font-semibold',
}

const SOCIAL_LINKS = {
  x: process.env.NEXT_PUBLIC_X_URL,
}

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
]

const TRUST_ITEMS = ['Per-platform customization', 'Queue + retries', 'OAuth token safety']

const FAQ_ITEMS = [
  {
    q: 'How quickly can I start publishing?',
    a: 'Start in under 10 minutes. Connect your channels, schedule your first post, and move from planning to publishing without a complicated setup.',
  },
  {
    q: 'Can I tailor content for each channel?',
    a: 'Yes. Customize copy, media, and timing for every destination while managing one shared campaign workflow. Keep your brand consistent while speaking to each audience correctly.',
  },
  {
    q: 'Why use Publr instead of multiple tools?',
    a: 'Publr replaces fragmented workflows with one unified publishing hub. Save time, reduce risk, and launch cross-channel campaigns with a single source of truth.',
  },
]

export default function HomePage() {
  const marqueeViewportRef = useRef<HTMLDivElement>(null)
  const marqueeSegmentRef = useRef<HTMLDivElement>(null)
  const [segmentWidth, setSegmentWidth] = useState(0)
  const [cloneCount, setCloneCount] = useState(1)
  const [isMarqueeReady, setIsMarqueeReady] = useState(false)

  const tickerItems = useMemo(
    () =>
      ENABLED_PLATFORMS.map((platform) => ({
        id: platform.name,
        label: PLATFORM_LABELS[platform.name],
      })),
    [],
  )

  useEffect(() => {
    const viewportEl = marqueeViewportRef.current
    const segmentEl = marqueeSegmentRef.current
    if (!viewportEl || !segmentEl) return

    let frameId: number | null = null

    const recomputeMarquee = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }

      frameId = requestAnimationFrame(() => {
        const nextSegmentWidth = Math.ceil(segmentEl.scrollWidth)
        const nextViewportWidth = Math.ceil(viewportEl.clientWidth)

        if (nextSegmentWidth <= 0 || nextViewportWidth <= 0) {
          setIsMarqueeReady(false)
          return
        }

        const nextCloneCount = Math.max(1, Math.ceil((nextViewportWidth * 2) / nextSegmentWidth))
        setSegmentWidth(nextSegmentWidth)
        setCloneCount(nextCloneCount)
        setIsMarqueeReady(true)
      })
    }

    const observer = new ResizeObserver(recomputeMarquee)
    observer.observe(viewportEl)
    observer.observe(segmentEl)
    recomputeMarquee()

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(recomputeMarquee).catch(() => {})
    }

    return () => {
      observer.disconnect()
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [tickerItems])

  const marqueeStyle = useMemo(() => {
    const durationSeconds =
      segmentWidth > 0 ? Math.max(12, segmentWidth / TICKER_PX_PER_SECOND) : 24
    return {
      '--segment-width': `${segmentWidth}px`,
      '--marquee-duration': `${durationSeconds}s`,
    } as CSSProperties
  }, [segmentWidth])

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: .35; }
        }
        .live-dot { animation: blink 2.2s ease-in-out infinite; }

        .feature-row { transition: background .18s; }
        .feature-row:hover { background: hsl(var(--muted)/.55); }
      `}</style>

      <main className="relative min-h-screen bg-background">
        <div aria-hidden className="home-bg">
          <div className="home-bg-orb home-bg-orb-a" />
          <div className="home-bg-orb home-bg-orb-b" />
          <div className="home-bg-vignette" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,hsl(var(--primary)/.2),transparent_65%)]"
        />

        {}
        <header className="sticky top-0 left-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link href="/" className="brand-wrap shrink-0">
                  <BrandName />
                </Link>
                <BetaBadge />
              </div>

              <div className="flex items-center gap-2 sm:hidden">
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chronex on X"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/65 transition-all hover:border-primary/40 hover:text-foreground"
                >
                  <XLogoIcon size={14} />
                </a>
                <ThemeToggle />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chronex on X"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/65 transition-all hover:border-primary/40 hover:text-foreground"
                >
                  <XLogoIcon size={14} />
                </a>
                <ThemeToggle />
              </div>

              <Button asChild size="sm" className="hidden w-full gap-1.5 sm:inline-flex sm:w-auto">
                <Link href="/post/createPost">
                  Open Studio
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {}
        <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          {}
          <div>
            {}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-primary/80" />
              <span className="font-mono text-[12px] font-medium tracking-[.14em] text-primary uppercase">
                Multi Platform Publishing
              </span>
            </motion.div>

            {}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-[clamp(44px,6.5vw,82px)] leading-[1.01] font-bold tracking-[-0.045em] text-foreground"
            >
              Decide once.
              <br />
              <span className="text-primary">Publish</span> everywhere.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 max-w-[430px] text-base leading-relaxed text-foreground/65 sm:text-[17px]"
            >
              Plan once, tailor per channel, and schedule your weekly content pipeline from one
              workspace.
            </motion.p>

            {}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.23 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="gap-2 px-6 text-[14px]">
                <Link href="/post/createPost">Start scheduling</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-1.5 text-[14px]">
                <Link href="/tokens">
                  Connect platforms
                  <ArrowUpRight className="size-3.5 opacity-70" />
                </Link>
              </Button>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-9"
            >
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Works with
              </p>
              <div className="flex flex-wrap gap-2">
                {ENABLED_PLATFORMS.map((p) => (
                  <span
                    key={p.name}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[12px] text-foreground/75 transition-colors hover:border-border hover:text-foreground"
                  >
                    <IconRenderer name={p.name} size={14} />
                    <span className="font-medium">{PLATFORM_LABELS[p.name]}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-foreground/60">{PLATFORM_CAPABILITY_LABELS[p.name]}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex flex-col gap-3"
          >
            {}
            <div className="overflow-hidden rounded-2xl border border-border/85 bg-card/95 shadow-sm backdrop-blur-sm">
              {}
              <div className="flex items-center justify-between border-b border-border/75 px-5 py-3.5">
                <div>
                  <p className="mb-0.5 font-mono text-[11px] font-semibold tracking-[.13em] text-primary uppercase">
                    On Deck
                  </p>
                  <p className="text-[14px] font-semibold text-foreground">
                    Your content is cooking
                  </p>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-foreground/60">
                  <span className="live-dot size-2 rounded-full bg-green-500" />
                  Vibing
                </span>
              </div>

              {}
              <div className="divide-y divide-border/50">
                {SCHEDULE.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-foreground/55">
                          {item.platform} · {item.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] tracking-wide uppercase ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/85 bg-border/80 shadow-sm">
              {[
                { value: '6', label: 'Channels synced' },
                { value: '3 min', label: 'To schedule your first week' },
              ].map((s) => (
                <div key={s.label} className="bg-card/95 px-6 py-5">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-foreground">{s.value}</p>
                  <p className="mt-1 text-[13px] font-medium text-foreground/60">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {}
        <div
          ref={marqueeViewportRef}
          className="seamless-marquee relative z-10 overflow-hidden border-y border-border/75 py-4"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-background to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-background to-transparent"
          />
          <div
            style={marqueeStyle}
            className={`seamless-marquee-track ${!isMarqueeReady ? 'seamless-marquee-track--paused' : ''}`}
          >
            <div ref={marqueeSegmentRef} className="seamless-marquee-segment gap-10 pr-10">
              {tickerItems.map((item, index) => (
                <span
                  key={`base-${item.id}-${index}`}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-[13px] leading-none font-medium whitespace-nowrap text-foreground/72"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <IconRenderer name={item.id} size={13} />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </span>
              ))}
            </div>

            {Array.from({ length: cloneCount }).map((_, copyIndex) => (
              <div
                key={`clone-${copyIndex}`}
                aria-hidden
                className="seamless-marquee-segment gap-10 pr-10"
              >
                {tickerItems.map((item, index) => (
                  <span
                    key={`clone-${copyIndex}-${item.id}-${index}`}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-[13px] leading-none font-medium whitespace-nowrap text-foreground/72"
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      <IconRenderer name={item.id} size={13} />
                    </span>
                    <span className="leading-none">{item.label}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 lg:py-20">
          <div className="mb-14 flex flex-col gap-2">
            <span className="font-mono text-[12px] font-semibold tracking-[.13em] text-primary uppercase">
              How it works
            </span>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.04em] text-foreground">
              Everything you need,
              <br />
              nothing you don&apos;t.
            </h2>
          </div>

          <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/85 shadow-sm">
            {FEATURES.map(({ num, title, desc, icon: Icon }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="feature-row grid grid-cols-[56px_1fr_auto] items-start gap-8 px-8 py-8 md:items-center"
              >
                {}
                <span className="pt-0.5 font-mono text-[13px] font-semibold text-foreground/40">
                  {num}
                </span>

                {}
                <div>
                  <p className="mb-1.5 text-[17px] font-semibold tracking-[-0.02em] text-foreground">
                    {title}
                  </p>
                  <p className="max-w-lg text-[14px] leading-relaxed text-foreground/60">{desc}</p>
                </div>

                {}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-14">
          <div className="mb-8 flex flex-col gap-2">
            <span className="font-mono text-[12px] font-semibold tracking-[.13em] text-primary uppercase">
              FAQ
            </span>
            <h2 className="text-[clamp(26px,3.4vw,38px)] font-bold tracking-[-0.04em] text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-18">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border/85 bg-card/90 px-10 py-14 shadow-sm md:px-16"
          >
            {}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/.15),transparent_60%)]"
            />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <p className="mb-4 font-mono text-[12px] font-semibold tracking-[.13em] text-primary uppercase">
                  Get started
                </p>
                <h2 className="text-[clamp(26px,3vw,38px)] leading-[1.1] font-bold tracking-[-0.04em] text-foreground">
                  Ready to ship your
                  <br />
                  first campaign?
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/60">
                  Connect your platforms in minutes and start scheduling content across all your
                  channels from a single workspace.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full gap-2 px-8 text-[14px] md:w-auto">
                  <Link href="/post/createPost">
                    Open Studio
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full text-[14px] md:w-auto"
                >
                  <Link href="/tokens">Connect platforms</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        <footer className="relative z-10 border-t border-border/70 bg-background/70">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Publr</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Schedule across your approved channels with confidence.
              </p>
            </div>

            <nav className="flex flex-wrap items-center gap-4 text-sm">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </main>
    </>
  )
}
