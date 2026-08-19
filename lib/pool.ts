'use client'

import { BATCH_SIZE, type Question, type Section } from './types'

/**
 * A standing pool of ready-made questions, so starting a test is instant.
 *
 * Generating five questions takes about half a minute, which is a long time to stare at
 * a button. The pool keeps one batch per section warm at all times: pressing Start hands
 * those over immediately and the pool refills itself in the background, alongside the
 * batches the running test is already fetching.
 *
 * This costs nothing extra over the life of the app. The ten questions in the pool are
 * simply the *next* test's first ten, generated early rather than on demand — only the
 * final prefetch, the one never spent, is wasted.
 */
const KEY = 'ohio-permit-pool'

/**
 * One batch's worth. That is a single request, so the pool refills quickly and little is
 * wasted if she stops taking tests. It also means the pool holds one section only, which
 * is why the section alternates between fills — otherwise every test would open with
 * five signs questions in a row.
 */
export const POOL_SIZE = BATCH_SIZE

const SECTION_KEY = 'ohio-permit-pool-section'

function nextSection(): Section {
  if (typeof window === 'undefined') return 'signs'
  return window.localStorage.getItem(SECTION_KEY) === 'rules' ? 'rules' : 'signs'
}

function flipSection() {
  window.localStorage.setItem(SECTION_KEY, nextSection() === 'signs' ? 'rules' : 'signs')
}

function read(): Question[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Question[]) : []
  } catch {
    return []
  }
}

function write(questions: Question[]) {
  window.localStorage.setItem(KEY, JSON.stringify(questions))
}

export function getPool(): Question[] {
  return read()
}

export function poolIsFull(): boolean {
  return read().length >= POOL_SIZE
}

/** Empties the pool and returns what was in it, to open a new test with. */
export function drainPool(): Question[] {
  const questions = read()
  write([])
  // The next pool is the other section, so consecutive tests don't open the same way.
  flipSection()
  return questions
}

export function addToPool(questions: Question[]) {
  const existing = read()
  const seen = new Set(existing.map((q) => q.id))
  write([...existing, ...questions.filter((q) => !seen.has(q.id))])
}

/**
 * What the pool still needs, or null when it's full. A partial batch is topped up in the
 * same section, so the questions she opens with are a coherent set rather than a
 * leftover mix.
 */
export function poolNeeds(): { section: Section; count: number } | null {
  const pool = read()
  const short = POOL_SIZE - pool.length
  if (short <= 0) return null
  return { section: pool[0]?.section ?? nextSection(), count: Math.min(BATCH_SIZE, short) }
}

/**
 * Prompts and signs already spoken for by the pool.
 *
 * The running test must exclude these, or a question sitting in the pool could be
 * generated again for the current test and she would meet it twice in a row — which is
 * the whole thing the exclusion list exists to prevent.
 */
export function poolPrompts(): string[] {
  return read()
    .filter((q) => q.signId === 'none')
    .map((q) => q.prompt)
}

export function poolSignIds(): string[] {
  return read()
    .filter((q) => q.signId !== 'none')
    .map((q) => q.signId)
}
