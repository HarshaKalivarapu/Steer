'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { findRepeatsOf } from '@/lib/dedup'
import { POOL_SIZE, drainPool, getPool, poolPrompts, poolSignIds } from '@/lib/pool'
import { listExams, recentPrompts, recentSignIds, saveExam } from '@/lib/storage'
import { BATCH_SIZE, type Exam, type Question } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inProgress, setInProgress] = useState<Exam | null>(null)
  const [ready, setReady] = useState(0)

  useEffect(() => {
    setInProgress(listExams().find((e) => !e.completedAt) ?? null)

    // The pool fills in the background, so poll briefly to keep the label honest.
    const update = () => setReady(getPool().length)
    update()
    const timer = setInterval(update, 2000)
    return () => clearInterval(timer)
  }, [])

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const id = crypto.randomUUID()

      /*
        Whatever the pool holds is free and instant — usually a full ten. It was written
        while the previous test was still generating, so re-check it against recent tests
        before use and drop anything that slipped through that race.
      */
      const seenText = recentPrompts()
      const seenSigns = new Set(recentSignIds())
      const prefetched = drainPool()
        .filter((q) =>
          q.signId === 'none'
            ? findRepeatsOf([q.prompt], seenText).length === 0
            : !seenSigns.has(q.signId),
        )
        .map((q, i) => ({ ...q, id: `${id}-pool-${i}` }))

      let questions: Question[] = prefetched

      if (questions.length === 0) {
        // Only on the very first run, before the pool has ever filled.
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            section: 'signs',
            count: BATCH_SIZE,
            examId: id,
            avoid: [...recentPrompts(), ...poolPrompts()],
            avoidSigns: [...recentSignIds(), ...poolSignIds()],
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        questions = ((await res.json()) as { questions: Question[] }).questions
      }

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

  const instant = ready > 0

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
          {generating ? 'Starting…' : instant ? 'Start test' : 'Generate test'}
        </button>

        {!generating && (
          <p className="text-center text-sm text-balance text-muted">
            {instant ? (
              <>
                <span className="tnum">{Math.min(ready, POOL_SIZE)}</span> questions ready —
                this starts straight away, and the rest are written while you answer.
              </>
            ) : (
              <>
                Your first <span className="tnum">{BATCH_SIZE}</span> questions take about
                half a minute. After this, tests start instantly.
              </>
            )}
          </p>
        )}

        {generating && !instant && (
          <p className="text-center text-sm text-balance text-muted">
            Writing your first questions. This only happens once.
          </p>
        )}

        {error && (
          <p className="rounded-sign border border-incorrect/30 bg-incorrect-soft px-4 py-3 text-sm text-incorrect">
            {error}
          </p>
        )}

        {inProgress && !generating && (
          <Link
            href={`/exam/${inProgress.id}`}
            className="rounded-sign border border-line bg-card px-6 py-4 text-center font-medium transition-colors hover:border-accent"
          >
            Resume test in progress —{' '}
            <span className="tnum">{Object.keys(inProgress.answers).length}</span> answered
          </Link>
        )}
      </section>
    </div>
  )
}
