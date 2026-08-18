'use client'

import type { Letter, Question } from '@/lib/types'
import SignArt from '@/components/SignArt'

interface Props {
  question: Question
  number: number
  total: number
  /** Undefined until she answers. Once set, it never changes. */
  selected?: Letter
  onSelect: (letter: Letter) => void
}

export default function QuestionCard({ question, number, total, selected, onSelect }: Props) {
  const locked = Boolean(selected)
  const signId = question.signId === 'none' ? undefined : question.signId

  return (
    <article className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-sm font-medium text-muted">
          <span>
            Question {number} of {total}
          </span>
          <span className="rounded-full bg-brand-soft px-3 py-1 text-brand">
            {question.section === 'signs' ? 'Road Signs' : 'Road Rules'}
          </span>
        </div>
        <h2 className="text-xl leading-relaxed font-medium">{question.prompt}</h2>

        {signId && (
          <div className="mt-2 flex justify-center rounded-xl border border-line bg-card py-6">
            <SignArt id={signId} className="h-44 w-44" />
          </div>
        )}
      </header>

      <ul className="flex flex-col gap-3">
        {question.options.map((option) => {
          const isCorrect = option.label === question.answer
          const isPicked = option.label === selected

          // Before she answers: everything neutral. After: the correct option is
          // always highlighted, and her pick is marked wrong if it missed.
          let tone = 'border-line bg-card'
          if (locked && isCorrect) tone = 'border-right bg-right-soft'
          else if (locked && isPicked) tone = 'border-wrong bg-wrong-soft'
          else if (locked) tone = 'border-line bg-card opacity-70'

          return (
            <li key={option.label}>
              <button
                onClick={() => !locked && onSelect(option.label)}
                disabled={locked}
                className={`w-full rounded-xl border px-5 py-4 text-left transition ${tone} ${
                  locked ? 'cursor-default' : 'hover:border-brand'
                }`}
              >
                <div className="flex gap-3">
                  <span className="font-semibold text-muted">{option.label}</span>
                  <span className="flex-1">{option.text}</span>
                  {locked && isCorrect && (
                    <span className="font-semibold text-right">Correct</span>
                  )}
                  {locked && isPicked && !isCorrect && (
                    <span className="font-semibold text-wrong">Your answer</span>
                  )}
                </div>

                {locked && (
                  <p className="mt-3 border-t border-line/70 pt-3 text-[0.95rem] leading-relaxed text-muted">
                    {option.why}
                  </p>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
