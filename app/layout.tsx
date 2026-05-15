import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.smilestoriesind.com'),

  title: 'Smile Stories | Best Dentist & Orthodontist in Jalandhar, Punjab',

  description:
    "Jalandhar's trusted dental clinic — clear aligners, braces, teeth whitening & more. Book instantly on WhatsApp or Instagram.",

  openGraph: {
    title: 'Smile Stories | Best Dentist in Jalandhar',
    description:
      "Trusted orthodontic care in Jalandhar. Clear aligners, braces, teeth whitening & more.",

    url: 'https://www.smilestoriesind.com',
    siteName: 'Smile Stories',

    images: [
      {
        url: '/images/og.png',
        width: 1200,
        height: 630,
      },
    ],

    locale: 'en_IN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',

    title: 'Smile Stories | Best Dentist in Jalandhar',

    description:
      "Trusted orthodontic care in Jalandhar. Clear aligners, braces & whitening.",

    images: ['/images/og.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
