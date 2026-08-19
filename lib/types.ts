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
 * Questions are generated in small batches, for two reasons. Vercel caps a serverless
 * function at 60 seconds on the Hobby tier, and a measured 5-question batch takes about
 * 27 seconds against roughly 148 for twenty — so five is the size that leaves real
 * headroom rather than a five-second margin. It also means she starts answering sooner.
 */
export const BATCH_SIZE = 5

/** True once every question has arrived. */
export function isComplete(exam: Exam): boolean {
  return exam.questions.length >= EXAM_SIZE
}

/**
 * The next batch to request, or null when the test is full. Sections are topped up
 * alternately so a half-finished test still has both kinds to answer.
 */
export function nextBatch(exam: Exam): { section: Section; count: number } | null {
  const shortfall = (section: Section) =>
    SECTION_SIZE - exam.questions.filter((q) => q.section === section).length

  const signs = shortfall('signs')
  const rules = shortfall('rules')
  if (signs <= 0 && rules <= 0) return null

  const section: Section = signs >= rules ? 'signs' : 'rules'
  return { section, count: Math.min(BATCH_SIZE, shortfall(section)) }
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
