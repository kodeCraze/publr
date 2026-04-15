import Link from 'next/link'
import { ArrowLeft, FileText, Gavel, ShieldCheck } from 'lucide-react'

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using Publr, you agree to these Terms and Conditions. If you do not agree, do not use the service.',
  },
  {
    title: 'Account Responsibilities',
    body: 'You are responsible for keeping your account credentials secure and for all activity that occurs under your account.',
  },
  {
    title: 'Connected Platforms',
    body: 'Publr interacts with third-party platforms through OAuth and approved permissions. You are responsible for complying with each connected platform policy.',
  },
  {
    title: 'Service Availability',
    body: 'We aim for reliable uptime but do not guarantee uninterrupted service. Features may be updated, limited, or discontinued.',
  },
  {
    title: 'Prohibited Use',
    body: 'Do not use Publr for illegal, abusive, spammy, or deceptive content. Violations may result in suspension or account termination.',
  },
  {
    title: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, Publr is provided "as is" without warranties. We are not liable for indirect or consequential damages.',
  },
  {
    title: 'Changes to Terms',
    body: 'We may update these terms when needed. Continued use after updates means you accept the revised terms.',
  },
  {
    title: 'Contact',
    body: 'For legal questions, contact us at support@publr.app.',
  },
]

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          <div className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              <Gavel className="size-3.5" />
              Terms and conditions
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Using Publr responsibly
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              These terms explain your rights and responsibilities while using Publr.
            </p>
          </div>
        </header>

        <section className="space-y-4">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-2xl border border-border/60 bg-card/70 p-5 sm:p-6"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
                <FileText className="size-3.5" />
                Section {String(index + 1).padStart(2, '0')}
              </div>
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
            </article>
          ))}
        </section>

        <div className="mt-8 rounded-2xl border border-border/70 bg-card/70 p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
            <ShieldCheck className="size-3.5" />
            Last updated
          </p>
          <p className="mt-2 text-sm text-muted-foreground">April 15, 2026</p>
        </div>
      </div>
    </main>
  )
}
