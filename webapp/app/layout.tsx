import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MusIQ - Rate. Discover. Influence.',
  description: 'Rate music, discover new sounds, and influence global rankings',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

