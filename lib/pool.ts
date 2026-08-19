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

/** Fixed at five per section, so shrinking the batch size doesn't shrink the pool. */
export const POOL_PER_SECTION = 5
export const POOL_SIZE = POOL_PER_SECTION * 2

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
  return questions
}

export function addToPool(questions: Question[]) {
  const existing = read()
  const seen = new Set(existing.map((q) => q.id))
  write([...existing, ...questions.filter((q) => !seen.has(q.id))])
}

/** The next batch the pool is short of, or null when it's full. */
export function poolNeeds(): { section: Section; count: number } | null {
  const pool = read()
  const shortfall = (section: Section) =>
    POOL_PER_SECTION - pool.filter((q) => q.section === section).length

  const signs = shortfall('signs')
  const rules = shortfall('rules')
  if (signs <= 0 && rules <= 0) return null

  const section: Section = signs >= rules ? 'signs' : 'rules'
  return { section, count: Math.min(BATCH_SIZE, shortfall(section)) }
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
