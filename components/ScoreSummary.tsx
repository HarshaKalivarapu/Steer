import Link from 'next/link'
import { PASS_PER_SECTION, type Exam, type SectionScore, scoreExam } from '@/lib/types'

function SectionRow({ title, score }: { title: string; score: SectionScore }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-4 last:border-0">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted">{PASS_PER_SECTION} of {score.total} needed to pass</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-semibold">
          {score.correct}/{score.total}
        </p>
        <p className={`text-sm font-medium ${score.passed ? 'text-right' : 'text-wrong'}`}>
          {score.passed ? 'Passed' : 'Not passed'}
        </p>
      </div>
    </div>
  )
}

export default function ScoreSummary({ exam }: { exam: Exam }) {
  const score = scoreExam(exam)

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-muted">You scored</p>
        <p className="text-5xl font-semibold tracking-tight">
          {score.correct}/{exam.questions.length}
        </p>
        <p
          className={`mt-3 inline-block rounded-full px-4 py-1.5 font-semibold ${
            score.passed ? 'bg-right-soft text-right' : 'bg-wrong-soft text-wrong'
          }`}
        >
          {score.passed ? 'Pass' : 'Not a pass yet'}
        </p>
      </header>

      <div className="rounded-xl border border-line bg-card px-5">
        <SectionRow title="Road Signs" score={score.signs} />
        <SectionRow title="Road Rules" score={score.rules} />
      </div>

      {!score.passed && (
        <p className="text-center leading-relaxed text-muted">
          The real exam scores each half on its own, so a strong half won&apos;t cover a weak
          one. Worth reviewing whichever section came up short.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="rounded-xl bg-brand px-6 py-4 text-center font-semibold text-white hover:opacity-90"
        >
          Take another test
        </Link>
        <Link
          href="/history"
          className="rounded-xl border border-line bg-card px-6 py-4 text-center font-medium hover:border-brand"
        >
          See past tests
        </Link>
      </div>
    </div>
  )
}
