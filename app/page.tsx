'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { listExams, recentPrompts, recentSignIds, saveExam } from '@/lib/storage'
import { BATCH_SIZE, type Exam, type Question } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inProgress, setInProgress] = useState<Exam | null>(null)

  useEffect(() => {
    setInProgress(listExams().find((e) => !e.completedAt) ?? null)
  }, [])

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const id = crypto.randomUUID()
      const avoid = recentPrompts()
      const avoidSigns = recentSignIds()

      const askFor = async (section: 'signs' | 'rules') => {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ section, count: BATCH_SIZE, examId: id, avoid, avoidSigns }),
        })
        if (!res.ok) throw new Error(await res.text())
        return ((await res.json()) as { questions: Question[] }).questions
      }

      /*
        Only the first batch is waited on. Firing the second one here too would either
        be abandoned when this page unmounts, or duplicate the request the exam page is
        about to make anyway — paying twice for the same five questions. So this asks
        for one batch and hands over; the exam page's loop picks up from there and has
        the next batch in hand long before she works through these.
      */
      const questions = await askFor('signs')
      const exam: Exam = {
        id,
        createdAt: new Date().toISOString(),
        questions,
        answers: {},
        currentIndex: 0,
      }
      saveExam(exam)
      router.push(`/exam/${exam.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Practice test</h1>
        <p className="mt-3 leading-relaxed text-balance text-muted">
          Each test has 40 questions — 20 on road signs and 20 on road rules, the same as
          the real Ohio BMV exam. You need 15 correct in each half to pass. You&apos;ll see
          whether you got each question right as soon as you answer it.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-sign bg-ink px-6 py-5 text-xl font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {generating ? 'Writing your test…' : 'Generate Test'}
        </button>

        {generating && (
          <p className="text-center text-sm text-balance text-muted">
            Your first <span className="tnum">{BATCH_SIZE}</span> questions take about half a
            minute. The rest are written while you answer them.
          </p>
        )}

        {error && <p className="rounded-sign border border-incorrect/30 bg-incorrect-soft px-4 py-3 text-sm text-incorrect">{error}</p>}

        {inProgress && !generating && (
          <Link
            href={`/exam/${inProgress.id}`}
            className="rounded-sign border border-line bg-card px-6 py-4 text-center font-medium transition-colors hover:border-accent"
          >
            Resume test in progress — <span className="tnum">{Object.keys(inProgress.answers).length}</span> answered
          </Link>
        )}
      </section>
    </div>
  )
}
