import { SIGNS } from '@/lib/signs'
import SignArt, { hasCustomImage } from '@/components/SignArt'

export const metadata = { title: 'Sign artwork' }

/**
 * Review sheet for the sign drawings. Not part of studying — it exists so the
 * artwork can be checked at a glance before it turns up inside a real test.
 */
export default function SignsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Sign artwork</h1>
        <p className="mt-2 leading-relaxed text-muted">
          Every sign the test can show. To replace a drawing with a real image, drop a
          file into <code className="font-mono text-sm">public/signs/</code> named after
          the id below — <code className="font-mono text-sm">stop.png</code>,{' '}
          <code className="font-mono text-sm">curve-right.jpg</code> — then restart the
          dev server. A question built on a bad drawing is worse than no question.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SIGNS.map((sign) => (
          <li
            key={sign.id}
            className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card p-4 text-center"
          >
            <SignArt id={sign.id} className="h-24 w-24" />
            <div>
              <p className="text-sm font-medium">{sign.name}</p>
              <p className="mt-1 font-mono text-xs text-muted">{sign.id}</p>
              <p
                className={`mt-1 text-xs ${
                  hasCustomImage(sign.id)
                    ? 'text-right'
                    : sign.art === 'rough'
                      ? 'text-wrong'
                      : 'text-muted'
                }`}
              >
                {hasCustomImage(sign.id)
                  ? 'your photo'
                  : sign.art === 'rough'
                    ? 'drawn — a photo would help'
                    : 'drawn — clear enough'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
