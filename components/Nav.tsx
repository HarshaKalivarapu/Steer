import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Practice' },
  { href: '/history', label: 'Past tests' },
  { href: '/signs', label: 'Signs' },
]

export default function Nav() {
  return (
    <header className="border-b border-line bg-card">
      <nav className="mx-auto flex w-full max-w-3xl items-baseline justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight lowercase sm:text-2xl"
          aria-label="Steer, home"
        >
          steer
          {/* A short camel rule under the wordmark — the one flourish in the whole app. */}
          <span aria-hidden className="mt-1 block h-[3px] w-8 bg-accent" />
        </Link>

        <div className="flex gap-4 text-sm sm:gap-6 sm:text-[0.95rem]">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              /*
                The negative margin gives each link a comfortable touch target without
                changing how the bar looks. Text-sized tap targets are the single most
                common way a desktop layout fails on a phone.
              */
              className="-my-2 py-2 whitespace-nowrap text-muted hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
