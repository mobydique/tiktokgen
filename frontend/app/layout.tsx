import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TikTok Video Generator',
  description: 'Generate AI videos for TikTok/Telegram promotion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
