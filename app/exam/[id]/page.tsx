'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import QuestionCard from '@/components/QuestionCard'
import ScoreSummary from '@/components/ScoreSummary'
import { appendQuestions, getExam, recordAnswer, setCurrentIndex } from '@/lib/storage'
import {
  EXAM_SIZE,
  isComplete,
  nextBatch,
  scoreExam,
  type Exam,
  type Letter,
  type Question,
} from '@/lib/types'

export default function ExamPage() {
  const { id } = useParams<{ id: string }>()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [restError, setRestError] = useState<string | null>(null)
  /** One batch in flight at a time. */
  const fetching = useRef(false)
  /**
   * Bounded so a persistent failure cannot loop. This effect re-runs on every answer,
   * so without a cap a broken batch would fire a billed request per click, forever.
   */
  const failures = useRef(0)

  useEffect(() => {
    const found = getExam(id)
    setExam(found ?? null)
    // A finished test opens straight to its score; that's what "review a past
    // test" means from the history page.
    if (found?.completedAt) setShowScore(true)
    setLoaded(true)
  }, [id])

  /**
   * Top the test up in the background, five questions at a time, while she answers.
   * Each completed batch changes `exam`, which re-runs this and pulls the next one,
   * so the loop drives itself until the test is full.
   */
  useEffect(() => {
    if (!exam || isComplete(exam) || fetching.current || failures.current >= 2) return
    const next = nextBatch(exam)
    if (!next) return

    fetching.current = true
    const used = exam.questions
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        section: next.section,
        count: next.count,
        examId: exam.id,
        avoid: used.filter((q) => q.signId === 'none').map((q) => q.prompt),
        avoidSigns: used.filter((q) => q.signId !== 'none').map((q) => q.signId),
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        const { questions } = (await res.json()) as { questions: Question[] }
        setRestError(null)
        setExam((current) => (current ? appendQuestions(current, questions) : current))
      })
      .catch((e: unknown) => {
        failures.current += 1
        setRestError(e instanceof Error ? e.message : 'Could not load the rest of the test.')
      })
      .finally(() => {
        fetching.current = false
      })
  }, [exam])

  if (!loaded) return null

  if (!exam) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-muted">That test could not be found on this device.</p>
        <Link href="/" className="font-semibold text-accent-deep hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  const score = scoreExam(exam)
  const index = Math.min(exam.currentIndex, exam.questions.length - 1)
  const question = exam.questions[index]
  const selected = exam.answers[question.id]
  const atEndOfLoaded = index === exam.questions.length - 1
  const stillWriting = !isComplete(exam)
  const isLast = atEndOfLoaded && !stillWriting
  const allAnswered = score.answered === EXAM_SIZE

  if (showScore) {
    return (
      <div className="flex flex-col gap-7 sm:gap-8">
        <ScoreSummary exam={exam} />
        <button
          onClick={() => {
            setShowScore(false)
            setExam(setCurrentIndex(exam, 0))
          }}
          className="text-center font-semibold text-accent-deep hover:underline"
        >
          Review the questions
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7 sm:gap-8">
      <div className="flex flex-col gap-3">
        <div className="tnum flex items-center justify-between text-sm font-semibold">
          <span className="text-correct">{score.correct} right</span>
          <span className="font-normal text-muted">
            {score.answered} of {EXAM_SIZE} answered
          </span>
          <span className="text-incorrect">{score.wrong} wrong</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-sign bg-line">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${(score.answered / EXAM_SIZE) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={question}
        number={index + 1}
        total={EXAM_SIZE}
        selected={selected}
        onSelect={(letter: Letter) => setExam(recordAnswer(exam, question.id, letter))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setExam(setCurrentIndex(exam, index - 1))}
          disabled={index === 0}
          className="rounded-sign border border-line bg-card px-5 py-3 font-medium transition-colors hover:border-accent disabled:opacity-40 disabled:hover:border-line"
        >
          Back
        </button>

        {atEndOfLoaded && stillWriting ? (
          <span className="order-last w-full rounded-sign border border-line bg-card px-4 py-3 text-center text-sm text-muted sm:order-none sm:w-auto sm:px-5">
            {restError ? 'Could not load the rest' : 'Writing the next questions…'}
          </span>
        ) : isLast ? (
          <button
            onClick={() => setShowScore(true)}
            disabled={!allAnswered}
            className="rounded-sign bg-ink px-5 py-3 font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40 sm:px-6"
          >
            See my score
          </button>
        ) : (
          <button
            onClick={() => setExam(setCurrentIndex(exam, index + 1))}
            disabled={!selected}
            className="rounded-sign bg-ink px-5 py-3 font-semibold text-paper transition-opacity hover:opacity-90 disabled:opacity-40 sm:px-6"
          >
            Next
          </button>
        )}
      </div>

      {!selected && (
        <p className="text-center text-sm text-muted">
          Choose an answer to continue. Once you pick, it&apos;s locked in.
        </p>
      )}

      {restError && (
        <p className="rounded-sign border border-incorrect/30 bg-incorrect-soft px-4 py-3 text-center text-sm text-incorrect">
          {restError} Your answers are saved. Reopen this test from Past Tests to try
          again.
        </p>
      )}
    </div>
  )
}
