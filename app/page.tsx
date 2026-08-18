'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { listExams, recentPrompts, recentSignIds, saveExam } from '@/lib/storage'
import { BATCH_SIZE, STARTER_SIZE, type Exam, type Question } from '@/lib/types'

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

      // One batch per section, in parallel. Two small requests finish in about the
      // time of one, and each stays well inside the serverless time limit. The rest
      // of the test is fetched by the exam page while she answers these.
      const batches = await Promise.all(
        (['signs', 'rules'] as const).map(async (section) => {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ section, count: BATCH_SIZE, examId: id, avoid, avoidSigns }),
          })
          if (!res.ok) throw new Error(await res.text())
          return ((await res.json()) as { questions: Question[] }).questions
        }),
      )
      const questions = batches.flat()
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
        <h1 className="text-3xl font-semibold tracking-tight">Practice Test</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Each test has 40 questions — 20 on road signs and 20 on road rules, the same as
          the real Ohio BMV exam. You need 15 correct in each half to pass. You&apos;ll see
          whether you got each question right as soon as you answer it.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <button
          onClick={generate}
          disabled={generating}
          className="rounded-xl bg-brand px-6 py-5 text-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {generating ? 'Writing your test…' : 'Generate Test'}
        </button>

        {generating && (
          <p className="text-center text-muted">
            Your first {STARTER_SIZE} questions take about half a minute. The rest are written
            while you answer them.
          </p>
        )}

        {error && <p className="rounded-lg bg-wrong-soft px-4 py-3 text-wrong">{error}</p>}

        {inProgress && !generating && (
          <Link
            href={`/exam/${inProgress.id}`}
            className="rounded-xl border border-line bg-card px-6 py-4 text-center font-medium hover:border-brand"
          >
            Resume test in progress — {Object.keys(inProgress.answers).length} answered
          </Link>
        )}
      </section>
    </div>
  )
}
