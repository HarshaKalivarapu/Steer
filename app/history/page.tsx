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
        <h1 className="text-3xl font-semibold tracking-tight">Past Tests</h1>
        <p className="mt-2 text-muted">
          Every test you&apos;ve taken, saved on this device. Open one to read back the
          questions and explanations.
        </p>
      </header>

      {exams.length === 0 ? (
        <div className="rounded-xl border border-line bg-card px-6 py-10 text-center">
          <p className="text-muted">No tests yet.</p>
          <Link href="/" className="mt-3 inline-block font-medium text-brand">
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
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-5 py-4"
              >
                <Link href={`/exam/${exam.id}`} className="flex-1">
                  <p className="font-medium">{formatDate(exam.createdAt)}</p>
                  <p className="text-sm text-muted">
                    {done
                      ? `Signs ${score.signs.correct}/${score.signs.total} · Rules ${score.rules.correct}/${score.rules.total}`
                      : `In progress — ${score.answered} of ${EXAM_SIZE} answered${
                          isComplete(exam) ? '' : ' (still being written)'
                        }`}
                  </p>
                </Link>

                {done && (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      score.passed ? 'bg-right-soft text-right' : 'bg-wrong-soft text-wrong'
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
                  className="text-sm text-muted hover:text-wrong"
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
