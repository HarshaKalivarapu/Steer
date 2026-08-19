'use client'

import { useEffect, useRef, useState } from 'react'
import { findRepeatsOf } from '@/lib/dedup'
import { addToPool, poolNeeds, poolPrompts, poolSignIds } from '@/lib/pool'
import { listExams, recentPrompts, recentSignIds } from '@/lib/storage'
import type { Question } from '@/lib/types'

/**
 * Keeps the ready-made question pool full, in the background, from wherever she is.
 *
 * This runs on every page, including during a test — that is the point. While the exam
 * fetches its next batch, this fetches the next test's opening batch in parallel, so
 * pressing Start is instant every time after the first.
 *
 * Renders nothing.
 */
export default function PoolWarmer() {
  const [tick, setTick] = useState(0)
  const inFlight = useRef(false)
  /** Bounded, so a persistent failure can't quietly spend money in a loop. */
  const failures = useRef(0)

  useEffect(() => {
    if (inFlight.current || failures.current >= 2) return
    const need = poolNeeds()
    if (!need) return

    /*
      Exclusions come from three places: the tests she has already taken, whatever is
      already in the pool, and any test currently in progress. That last one matters —
      the running test is still generating questions, and without it the pool could be
      handed a question she is about to see.
    */
    const live = listExams().find((e) => !e.completedAt)?.questions ?? []
    const avoid = [
      ...recentPrompts(),
      ...poolPrompts(),
      ...live.filter((q) => q.signId === 'none').map((q) => q.prompt),
    ]
    const avoidSigns = [
      ...recentSignIds(),
      ...poolSignIds(),
      ...live.filter((q) => q.signId !== 'none').map((q) => q.signId),
    ]

    inFlight.current = true
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        section: need.section,
        count: need.count,
        examId: 'pool',
        avoid,
        avoidSigns,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        const { questions } = (await res.json()) as { questions: Question[] }

        /*
          The exclusion list was a snapshot taken before this request went out, and the
          running test has been fetching its own batches the whole time. So re-check
          against the test as it stands now and drop anything that collided. The pool
          yields, never the test — she is answering that one right now.
        */
        const current = listExams().find((e) => !e.completedAt)?.questions ?? []
        const currentText = current.filter((q) => q.signId === 'none').map((q) => q.prompt)
        const currentSigns = new Set(
          current.filter((q) => q.signId !== 'none').map((q) => q.signId),
        )
        const safe = questions.filter((q) =>
          q.signId === 'none'
            ? findRepeatsOf([q.prompt], currentText).length === 0
            : !currentSigns.has(q.signId),
        )

        addToPool(safe)
        failures.current = 0
        setTick((n) => n + 1) // fetch the next batch, if the pool is still short
      })
      .catch(() => {
        // Nothing is shown for this. It's a background nicety, and a failure just means
        // the next test is generated the slow way.
        failures.current += 1
      })
      .finally(() => {
        inFlight.current = false
      })
  }, [tick])

  return null
}
