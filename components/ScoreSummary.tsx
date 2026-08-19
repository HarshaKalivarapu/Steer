import Link from 'next/link'
import { EXAM_SIZE, PASS_PER_SECTION, type Exam, type SectionScore, scoreExam } from '@/lib/types'

function SectionRow({ title, score }: { title: string; score: SectionScore }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-4 last:border-0 sm:gap-4 sm:py-5">
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="tnum mt-0.5 text-sm text-muted">
          {PASS_PER_SECTION} of {score.total} needed to pass
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <p className="tnum text-xl font-bold sm:text-2xl">
          {score.correct}
          <span className="text-muted">/{score.total}</span>
        </p>
        <span
          aria-hidden
          className={`h-10 w-1 rounded-sign ${score.passed ? 'bg-correct' : 'bg-incorrect'}`}
        />
        <p
          className={`w-14 text-xs font-bold tracking-wide uppercase sm:w-20 sm:text-sm ${
            score.passed ? 'text-correct' : 'text-incorrect'
          }`}
        >
          {score.passed ? 'Passed' : 'Not yet'}
        </p>
      </div>
    </div>
  )
}

export default function ScoreSummary({ exam }: { exam: Exam }) {
  const score = scoreExam(exam)

  return (
    <div className="flex flex-col gap-7 sm:gap-8">
      <header className="text-center">
        <p className="text-sm tracking-wide text-muted uppercase">You scored</p>
        <p className="tnum mt-1 text-5xl font-bold tracking-tight sm:text-6xl">
          {score.correct}
          <span className="text-muted">/{EXAM_SIZE}</span>
        </p>
        <p
          className={`mt-4 inline-block rounded-sign px-4 py-1.5 text-sm font-bold tracking-wide uppercase ${
            score.passed ? 'bg-correct text-paper' : 'bg-incorrect text-paper'
          }`}
        >
          {score.passed ? 'Pass' : 'Not a pass yet'}
        </p>
      </header>

      <div className="rounded-sign border border-line bg-card px-4 sm:px-6">
        <SectionRow title="Road signs" score={score.signs} />
        <SectionRow title="Road rules" score={score.rules} />
      </div>

      {!score.passed && (
        <p className="text-center leading-relaxed text-balance text-muted">
          The real exam scores each half on its own, so a strong half won&apos;t cover a weak
          one. Worth reviewing whichever section came up short.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="rounded-sign bg-ink px-6 py-4 text-center font-semibold text-paper transition-opacity hover:opacity-90"
        >
          Take another test
        </Link>
        <Link
          href="/history"
          className="rounded-sign border border-line bg-card px-6 py-4 text-center font-medium transition-colors hover:border-accent"
        >
          See past tests
        </Link>
      </div>
    </div>
  )
}
