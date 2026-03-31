import type { Metadata } from 'next'
import './globals.css'
import { TRPCProvider } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { jetBrainsMono } from '@/lib/fonts'
import { Analytics } from '@vercel/analytics/next'
export const metadata: Metadata = {
  metadataBase: new URL('https://chronex.princecodes.tech'),
  title: 'Chronex',
  description: 'A unified platform to schedule and manage your content across all platforms.',
  openGraph: {
    type: 'website',
    siteName: 'Chronex',
    title: 'Chronex',
    description: 'Schedule and manage your content across all platforms.',
    url: 'https://chronex.princecodes.tech',
    images: [
      {
        url: '/image.png', // serve from /public
        width: 1200,
        height: 630,
        alt: 'Chronex – Social Media Scheduler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chronex',
    description: 'Schedule and manage your content across all platforms.',
    images: ['/image.png'],
    site: '@prncexe',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetBrainsMono.variable} antialiased`}>
        <TRPCProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </TRPCProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
