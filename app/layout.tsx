import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fun Chat - Chat with your friends',
  description: 'Fun Chat - Chat with your friends',
  generator: 'Fun Chat - Chat with your friends',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
