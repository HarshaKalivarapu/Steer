import type { Metadata, Viewport } from 'next'
import { Overpass } from 'next/font/google'
import Nav from '@/components/Nav'
import PoolWarmer from '@/components/PoolWarmer'
import './globals.css'

/*
  Overpass was drawn from the FHWA series typefaces used on US highway signs, so it
  carries the engineered feel of real signage without dressing up as it. It also keeps
  the app clear of the Inter/Poppins look that reads as generic software at a glance.
*/
const overpass = Overpass({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-overpass',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Steer',
  description: 'Practice tests for the Ohio BMV knowledge exam',
}

/*
  This is used on a phone more than anything else. `viewportFit: 'cover'` lets the page
  reach under the rounded corners and home indicator on newer iPhones; globals.css then
  pads the safe areas back in so nothing important sits under them.

  User scaling is deliberately left enabled — she is studying dense text on a small
  screen, and blocking pinch-zoom on a learning app would be a poor trade.
*/
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f0ebe1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={overpass.variable}>
      <body>
        <Nav />
        {/* Keeps the next test's opening questions ready. Renders nothing. */}
        <PoolWarmer />
        <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-10">{children}</main>
      </body>
    </html>
  )
}
