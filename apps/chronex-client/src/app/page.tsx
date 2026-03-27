'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, CalendarClock, Layers3, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { poppins } from '@/lib/fonts'

/* ─── Data ─── */
const PLATFORMS = [
  { name: 'Instagram', color: '#E1306C' },
  { name: 'Threads', color: '#888888' },
  { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Slack', color: '#E01E5A' },
  { name: 'Discord', color: '#5865F2' },
]

const SCHEDULE = [
  {
    platform: 'Instagram',
    color: '#E1306C',
    time: 'Today  ·  9:00 AM',
    status: 'queued',
    title: 'Welcome campaign post',
  },
  {
    platform: 'LinkedIn',
    color: '#0A66C2',
    time: 'Today  ·  11:30 AM',
    status: 'queued',
    title: 'Product announcement',
  },
  {
    platform: 'Threads',
    color: '#888888',
    time: 'Today  ·  2:00 PM',
    status: 'draft',
    title: 'Behind the scenes',
  },
  {
    platform: 'Discord',
    color: '#5865F2',
    time: 'Yesterday',
    status: 'sent',
    title: 'New feature announcement',
  },
  {
    platform: 'Slack',
    color: '#E01E5A',
    time: 'Yesterday',
    status: 'sent',
    title: 'Weekly newsletter teaser',
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
  queued: 'bg-primary/10 text-primary',
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-green-500/10 text-green-600 dark:text-green-400',
}

/* ─── Component ─── */
export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 24s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: .35; }
        }
        .live-dot { animation: blink 2.2s ease-in-out infinite; }

        .feature-row { transition: background .18s; }
        .feature-row:hover { background: hsl(var(--muted)/.35); }
      `}</style>

      <main className="relative min-h-screen overflow-x-hidden bg-background">
        {/* ── Ambient ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,hsl(var(--primary)/.13),transparent_65%)]"
        />

        {/* ── Header ── */}
        <header className="relative z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4.5">
            {/* Logo */}
            <Link href="/" className="brand-wrap">
              <span
                className={` ${poppins.className} relative inline-block text-xl leading-none font-semibold tracking-tight text-primary-foreground`}
              >
                <span className="absolute inset-0 -skew-y-6 rounded-lg bg-primary/90 shadow-md" />
                <span className="relative inline-block px-4 py-2">Chronex</span>
              </span>{' '}
            </Link>

            {/* Nav */}
            {/* <nav className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
              {['Solutions', 'Customers', 'Pricing'].map(n => (
                <Link key={n} href="/" className="hover:text-foreground transition-colors">{n}</Link>
              ))}
            </nav> */}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/post/createPost">
                  Open Studio
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="h-px w-8 bg-primary/60" />
              <span className="font-mono text-[11px] tracking-[.16em] text-primary uppercase">
                Campaign publishing — simplified
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-[clamp(44px,6.5vw,82px)] leading-[1.01] font-bold tracking-[-0.045em] text-foreground"
            >
              Plan once.
              <br />
              <span className="text-primary">Publish</span> everywhere.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 max-w-[430px] text-base leading-relaxed text-muted-foreground sm:text-[17px]"
            >
              A modern publishing control surface for teams — connected platforms, shared media,
              platform-aware content, and scheduling you can trust.
            </motion.p>

            {/* CTA */}
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
                  <ArrowUpRight className="size-3.5 opacity-60" />
                </Link>
              </Button>
            </motion.div>

            {/* Platform pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-9 flex flex-wrap gap-2"
            >
              {PLATFORMS.map((p) => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <span className="size-1.5 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right – Schedule Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="flex flex-col gap-3"
          >
            {/* Schedule card */}
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 backdrop-blur-sm">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                <div>
                  <p className="mb-0.5 font-mono text-[10px] tracking-[.14em] text-primary uppercase">
                    Upcoming
                  </p>
                  <p className="text-[13px] font-medium text-foreground">5 posts scheduled</p>
                </div>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                  <span className="live-dot size-1.5 rounded-full bg-green-500" />
                  Live
                </span>
              </div>

              {/* Schedule rows */}
              <div className="divide-y divide-border/40">
                {SCHEDULE.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {item.platform} · {item.time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60">
              {[
                { value: '5+', label: 'Platform Integrations' },
                { value: '∞', label: 'Tabs this replaces' },
              ].map((s) => (
                <div key={s.label} className="bg-card/90 px-6 py-5">
                  <p className="text-3xl font-bold tracking-[-0.04em] text-foreground">{s.value}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Ticker ── */}
        <div className="relative z-10 overflow-hidden border-y border-border/50 py-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-background to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-background to-transparent"
          />
          <div className="ticker-track flex w-max">
            {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-3 px-10 font-mono text-[11px] tracking-[.1em] whitespace-nowrap text-muted-foreground uppercase"
              >
                <span className="size-1.5 rounded-full" style={{ background: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="mb-14 flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[.14em] text-primary uppercase">
              How it works
            </span>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.04em] text-foreground">
              Everything you need,
              <br />
              nothing you don&apos;t.
            </h2>
          </div>

          <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {FEATURES.map(({ num, title, desc, icon: Icon }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="feature-row grid grid-cols-[56px_1fr_auto] items-start gap-8 px-8 py-8 md:items-center"
              >
                {/* Number */}
                <span className="pt-0.5 font-mono text-[13px] text-muted-foreground/50">{num}</span>

                {/* Text */}
                <div>
                  <p className="mb-1 text-[17px] font-semibold tracking-[-0.02em] text-foreground">
                    {title}
                  </p>
                  <p className="max-w-lg text-[14px] leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>

                {/* Icon */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-primary/5 text-primary">
                  <Icon className="size-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 px-10 py-14 md:px-16"
          >
            {/* Ambient inside CTA */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/.1),transparent_60%)]"
            />

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <p className="mb-4 font-mono text-[11px] tracking-[.14em] text-primary uppercase">
                  Get started
                </p>
                <h2 className="text-[clamp(26px,3vw,38px)] leading-[1.1] font-bold tracking-[-0.04em] text-foreground">
                  Ready to ship your
                  <br />
                  first campaign?
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
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
      </main>
    </>
  )
}
