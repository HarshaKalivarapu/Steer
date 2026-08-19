'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { deleteExam, listExams } from '@/lib/storage'
import { EXAM_SIZE, isComplete, scoreExam, type Exam } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function HistoryPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setExams(listExams())
    setLoaded(true)
  }, [])

  if (!loaded) return null

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Past tests</h1>
        <p className="mt-2 text-balance text-muted">
          Every test you&apos;ve taken, saved on this device. Open one to read back the
          questions and explanations.
        </p>
      </header>

      {exams.length === 0 ? (
        <div className="rounded-sign border border-line bg-card px-6 py-12 text-center">
          <p className="text-muted">No tests yet.</p>
          <Link href="/" className="mt-3 inline-block font-semibold text-accent-deep hover:underline">
            Generate your first one
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {exams.map((exam) => {
            const score = scoreExam(exam)
            const done = Boolean(exam.completedAt)
            return (
              <li
                key={exam.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-sign border border-line bg-card px-4 py-4 sm:px-5"
              >
                <Link href={`/exam/${exam.id}`} className="min-w-0 flex-1">
                  <p className="font-medium">{formatDate(exam.createdAt)}</p>
                  <p className="tnum mt-0.5 text-sm text-muted">
                    {done
                      ? `Signs ${score.signs.correct}/${score.signs.total} · Rules ${score.rules.correct}/${score.rules.total}`
                      : `In progress — ${score.answered} of ${EXAM_SIZE} answered${
                          isComplete(exam) ? '' : ' (still being written)'
                        }`}
                  </p>
                </Link>

                {done && (
                  <span
                    className={`rounded-sign px-3 py-1 text-xs font-bold tracking-wide uppercase ${
                      score.passed
                        ? 'bg-correct-soft text-correct'
                        : 'bg-incorrect-soft text-incorrect'
                    }`}
                  >
                    {score.passed ? 'Pass' : 'Fail'}
                  </span>
                )}

                <button
                  onClick={() => {
                    deleteExam(exam.id)
                    setExams(listExams())
                  }}
                  aria-label="Delete this test"
                  className="-my-2 py-2 text-sm text-muted transition-colors hover:text-incorrect"
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
