'use client'

import { useEffect, useRef } from 'react'
import { findRepeatsOf } from '@/lib/dedup'
import { POOL_SIZE, addToPool, getPool, poolNeeds, poolPrompts, poolSignIds } from '@/lib/pool'
import { listExams, recentPrompts, recentSignIds } from '@/lib/storage'
import type { Question } from '@/lib/types'

/**
 * Keeps the ready-made question pool full, in the background, from wherever she is.
 *
 * This runs on every page, including during a test — that is the point. While the exam
 * fetches its next batch, this fetches the next test's opening batch in parallel, so
 * pressing Start is instant every time after the first.
 *
 * It polls rather than reacting to events, and that is deliberate. This component sits in
 * the root layout, so it never remounts as she moves between pages, and the pool is
 * drained by a different component entirely. An earlier version only re-checked after a
 * successful fetch, which meant that once the home page emptied the pool nothing ever
 * told this component to refill it — the first test was instant and every one after it
 * waited.
 *
 * Renders nothing.
 */

/** How often to look at the pool. Cheap: it only reads localStorage. */
const CHECK_INTERVAL_MS = 4000

/**
 * Consecutive attempts that produce nothing before giving up. An attempt is unproductive
 * if the request failed, or if everything it returned collided with the running test.
 * Without this, a batch that is fully screened out would be re-requested forever, and
 * every one of those requests is billed.
 */
const MAX_BARREN_ATTEMPTS = 3

export default function PoolWarmer() {
  const inFlight = useRef(false)
  const barren = useRef(0)
  const lastSize = useRef(-1)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (cancelled || inFlight.current) return

      const size = getPool().length

      // A drop in pool size means a test just started. Give the refill a fresh budget,
      // so an earlier bad run can't leave the pool permanently cold.
      if (size < lastSize.current) barren.current = 0
      lastSize.current = size

      if (size >= POOL_SIZE || barren.current >= MAX_BARREN_ATTEMPTS) return
      const need = poolNeeds()
      if (!need) return

      /*
        Exclusions come from three places: tests already taken, whatever is already in
        the pool, and any test currently in progress. That last one matters — the running
        test is still generating, and without it the pool could be handed a question she
        is about to see.
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
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...need, purpose: 'pool', examId: 'pool', avoid, avoidSigns }),
        })
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

        if (safe.length > 0) {
          addToPool(safe)
          lastSize.current = getPool().length
          barren.current = 0
        } else {
          barren.current += 1
        }
      } catch {
        // Nothing is surfaced for this. It's a background nicety, and a failure only
        // means the next test is generated the slow way.
        barren.current += 1
      } finally {
        inFlight.current = false
      }
    }

    void check()
    const timer = setInterval(check, CHECK_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return null
}
