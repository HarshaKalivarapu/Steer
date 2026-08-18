import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ohio Permit Practice',
  description: 'Practice tests for the Ohio BMV knowledge exam',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-5 py-8">{children}</main>
      </body>
    </html>
  )
}
