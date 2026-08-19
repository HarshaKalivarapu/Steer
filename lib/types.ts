export type Section = 'signs' | 'rules'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Letter = 'A' | 'B' | 'C' | 'D'

export const LETTERS: Letter[] = ['A', 'B', 'C', 'D']

export interface Option {
  label: Letter
  text: string
  /** Shown after she answers — why this option is right or wrong. 2-3 lines. */
  why: string
}

export interface Question {
  id: string
  section: Section
  difficulty: Difficulty
  prompt: string
  /** Id from lib/signs.ts, or 'none'. The app draws it; the model never supplies artwork. */
  signId: string
  options: Option[]
  answer: Letter
}

export interface Exam {
  id: string
  createdAt: string
  completedAt?: string
  questions: Question[]
  /** questionId -> the letter she picked. Absent means unanswered. Never overwritten. */
  answers: Record<string, Letter>
  /** Which question she's looking at now. */
  currentIndex: number
}

/** The real Ohio test scores signs and rules separately: 15/20 needed on each. */
export const SECTION_SIZE = 20
export const PASS_PER_SECTION = 15
export const EXAM_SIZE = SECTION_SIZE * 2

/**
 * How many questions one request writes.
 *
 * Batch size turned out not to be the thing that made requests slow. Production logs
 * showed a 3-question batch returning 3,721 output tokens against 3,952 for five —
 * nearly all of it thinking, not questions. Lowering the effort level in the route cut a
 * measured batch from 45s to 15s, which left room to go back to five.
 *
 * Time still tracks output volume at roughly 12ms per token, so if a future change makes
 * generations longer this is one of the two dials; effort in the route is the other, and
 * the more powerful one.
 */
export const BATCH_SIZE = 5

/** True once every question has arrived. */
export function isComplete(exam: Exam): boolean {
  return exam.questions.length >= EXAM_SIZE
}

/**
 * The batches still needed, at most one per section.
 *
 * Both are returned so they can be fetched concurrently. With three questions per
 * request a full test is fourteen batches, and running them one after another would
 * take longer than she takes to answer; in parallel it comfortably stays ahead.
 */
export function nextBatches(exam: Exam): { section: Section; count: number }[] {
  const shortfall = (section: Section) =>
    SECTION_SIZE - exam.questions.filter((q) => q.section === section).length

  return (['signs', 'rules'] as const)
    .map((section) => ({ section, count: Math.min(BATCH_SIZE, shortfall(section)) }))
    .filter((b) => b.count > 0)
}

export interface SectionScore {
  correct: number
  answered: number
  total: number
  passed: boolean
}

export interface Score {
  signs: SectionScore
  rules: SectionScore
  correct: number
  wrong: number
  answered: number
  passed: boolean
}

export function scoreExam(exam: Exam): Score {
  const bySection = (section: Section): SectionScore => {
    const qs = exam.questions.filter((q) => q.section === section)
    const answered = qs.filter((q) => exam.answers[q.id])
    const correct = answered.filter((q) => exam.answers[q.id] === q.answer).length
    return {
      correct,
      answered: answered.length,
      // Always the real exam's section size, so a half-generated test still shows
      // "3/20" rather than flattering her with "3/8".
      total: SECTION_SIZE,
      passed: correct >= PASS_PER_SECTION,
    }
  }

  const signs = bySection('signs')
  const rules = bySection('rules')
  const correct = signs.correct + rules.correct
  const answered = signs.answered + rules.answered

  return {
    signs,
    rules,
    correct,
    wrong: answered - correct,
    answered,
    passed: signs.passed && rules.passed,
  }
}
