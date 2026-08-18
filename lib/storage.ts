'use client'

import type { Exam, Letter } from './types'

// One user, one browser, no accounts. localStorage is the whole database.
const KEY = 'ohio-permit-exams'

function readAll(): Exam[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Exam[]) : []
  } catch {
    return []
  }
}

function writeAll(exams: Exam[]) {
  window.localStorage.setItem(KEY, JSON.stringify(exams))
}

export function listExams(): Exam[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getExam(id: string): Exam | undefined {
  return readAll().find((e) => e.id === id)
}

export function saveExam(exam: Exam) {
  const exams = readAll()
  const i = exams.findIndex((e) => e.id === exam.id)
  if (i >= 0) exams[i] = exam
  else exams.push(exam)
  writeAll(exams)
}

export function deleteExam(id: string) {
  writeAll(readAll().filter((e) => e.id !== id))
}

/**
 * Answers are write-once. Once she commits to a letter it stays committed, so
 * revisiting an earlier question is always read-only.
 */
export function recordAnswer(exam: Exam, questionId: string, letter: Letter): Exam {
  if (exam.answers[questionId]) return exam
  const next: Exam = { ...exam, answers: { ...exam.answers, [questionId]: letter } }
  if (Object.keys(next.answers).length === next.questions.length) {
    next.completedAt = new Date().toISOString()
  }
  saveExam(next)
  return next
}

/** Adds the background half to an exam already in progress. */
export function appendQuestions(exam: Exam, questions: Exam['questions']): Exam {
  const existing = new Set(exam.questions.map((q) => q.id))
  const fresh = questions.filter((q) => !existing.has(q.id))
  if (fresh.length === 0) return exam
  const next: Exam = { ...exam, questions: [...exam.questions, ...fresh] }
  saveExam(next)
  return next
}

export function setCurrentIndex(exam: Exam, index: number): Exam {
  const next = { ...exam, currentIndex: index }
  saveExam(next)
  return next
}

/**
 * Question prompts from the most recent tests, sent to the generator so the next
 * test avoids repeating them. Three tests is the window the study value depends on —
 * beyond that a repeat is a useful refresher rather than a waste.
 */
export function recentPrompts(testCount = 3): string[] {
  return listExams()
    .slice(0, testCount)
    .flatMap((exam) => exam.questions)
    .filter((q) => q.signId === 'none') // sign questions are tracked by signId instead
    .map((q) => q.prompt)
}

/**
 * Signs shown in recent tests. Tracked separately because image questions all share
 * the same stem shape ("What does this sign mean?"), so comparing their wording is
 * meaningless — what makes two of them the same question is the sign itself.
 */
export function recentSignIds(testCount = 3): string[] {
  return listExams()
    .slice(0, testCount)
    .flatMap((exam) => exam.questions)
    .filter((q) => q.signId !== 'none')
    .map((q) => q.signId)
}
