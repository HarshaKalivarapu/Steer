import Link from 'next/link'

export default function Nav() {
  return (
    <header className="border-b border-line bg-card">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Ohio Permit Practice
        </Link>
        <div className="flex gap-5 text-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <Link href="/history" className="hover:text-ink">
            Past Tests
          </Link>
          <Link href="/signs" className="hover:text-ink">
            Signs
          </Link>
        </div>
      </nav>
    </header>
  )
}
