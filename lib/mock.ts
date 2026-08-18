import type { Question, Section } from './types'

/**
 * Placeholder test used when ANTHROPIC_API_KEY isn't set, so the UI can be built
 * and clicked through without spending anything. These are NOT study material —
 * they cycle a handful of stems to fill 40 slots.
 */
const SIGNS: Omit<Question, 'id' | 'section'>[] = [
  {
    difficulty: 'easy',
    signId: 'yield',
    prompt: '[Sample] What does this sign mean?',
    answer: 'B',
    options: [
      { label: 'A', text: 'Stop completely', why: 'A full stop is required at a red octagonal STOP sign.' },
      { label: 'B', text: 'Yield to other traffic', why: 'Correct. Slow down and let cross traffic go first.' },
      { label: 'C', text: 'Merging traffic ahead', why: 'Merge warnings are yellow diamonds.' },
      { label: 'D', text: 'Construction ahead', why: 'Construction warnings are orange.' },
    ],
  },
  {
    difficulty: 'medium',
    signId: 'none',
    prompt: '[Sample] A solid yellow line on your side of the center line means:',
    answer: 'B',
    options: [
      { label: 'A', text: 'You may pass if clear', why: 'Only a broken line on your side permits passing.' },
      { label: 'B', text: 'You may not pass', why: 'Correct. Solid yellow on your side prohibits passing.' },
      { label: 'C', text: 'Traffic moves the same way', why: 'Yellow separates opposing traffic; white separates same-direction.' },
      { label: 'D', text: 'The road ends ahead', why: 'Pavement markings never signal the end of a road.' },
    ],
  },
]

const RULES: Omit<Question, 'id' | 'section'>[] = [
  {
    difficulty: 'easy',
    signId: 'none',
    prompt: '[Sample] Unless a sign prohibits it, you may turn right on red in Ohio:',
    answer: 'B',
    options: [
      { label: 'A', text: 'Without stopping if clear', why: 'A complete stop is always required first.' },
      { label: 'B', text: 'After a complete stop', why: 'Correct. Ohio permits it after a full stop and yielding.' },
      { label: 'C', text: 'Only between 6am and 9pm', why: 'Ohio sets no time-of-day restriction.' },
      { label: 'D', text: 'Never — it is prohibited', why: 'Right on red is legal in Ohio by default.' },
    ],
  },
  {
    difficulty: 'medium',
    signId: 'none',
    prompt: '[Sample] A stopped school bus has its red lights flashing. You must stop at least:',
    answer: 'A',
    options: [
      { label: 'A', text: '10 feet away', why: 'Correct. Ohio requires at least 10 feet.' },
      { label: 'B', text: '5 feet away', why: 'Too close to give children a safe crossing margin.' },
      { label: 'C', text: '25 feet away', why: 'This overstates the requirement.' },
      { label: 'D', text: '50 feet away', why: '50 feet is the railroad-crossing parking distance.' },
    ],
  },
]

function fill(
  id: string,
  section: Section,
  count: number,
  bank: Omit<Question, 'id' | 'section'>[],
): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    ...bank[i % bank.length],
    id: `${id}-${section}-${Date.now()}-${i}`,
    section,
  }))
}

export function mockQuestions(id: string, section: Section, count: number): Question[] {
  return fill(id, section, count, section === 'signs' ? SIGNS : RULES)
}
