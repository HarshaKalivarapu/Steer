'use client'

import SignArt from '@/components/SignArt'
import type { Letter, Question } from '@/lib/types'

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
    <article className="flex flex-col gap-5 sm:gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="tnum text-muted">
            Question {number} of {total}
          </span>
          <span className="rounded-sign bg-accent-soft px-2.5 py-1 text-xs font-semibold tracking-wide text-accent-deep uppercase">
            {question.section === 'signs' ? 'Road signs' : 'Road rules'}
          </span>
        </div>

        <h2 className="text-[1.2rem] leading-snug font-semibold text-balance sm:text-[1.35rem]">
          {question.prompt}
        </h2>

        {signId && (
          <div className="mt-1 flex justify-center rounded-sign border border-line bg-card py-6 sm:py-8">
            <SignArt id={signId} className="h-36 w-36 sm:h-44 sm:w-44" />
          </div>
        )}
      </header>

      <ul className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const isCorrect = option.label === question.answer
          const isPicked = option.label === selected

          /*
            The left bar carries the feedback: neutral sand while she is deciding, then
            bottle green on the right answer and oxblood on hers if she missed.
            Everything else stays quiet so those two colours hold all the signal.
          */
          let bar = 'bg-line'
          let panel = 'border-line bg-card'
          let body = ''

          if (locked && isCorrect) {
            bar = 'bg-correct'
            panel = 'border-correct/30 bg-correct-soft'
          } else if (locked && isPicked) {
            bar = 'bg-incorrect'
            panel = 'border-incorrect/30 bg-incorrect-soft'
          } else if (locked) {
            body = 'opacity-60'
          }

          return (
            <li key={option.label}>
              <button
                onClick={() => !locked && onSelect(option.label)}
                disabled={locked}
                className={`flex w-full overflow-hidden rounded-sign border text-left transition-colors ${panel} ${
                  locked ? 'cursor-default' : 'hover:border-accent'
                }`}
              >
                <span aria-hidden className={`w-1 shrink-0 self-stretch ${bar}`} />

                <span className={`min-w-0 flex-1 px-3.5 py-3 sm:px-4 sm:py-3.5 ${body}`}>
                  {/*
                    Wrapping matters here. On a narrow phone the status label cannot sit
                    beside a full-length answer, so it drops to its own line instead of
                    squeezing the text into a column two words wide.
                  */}
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <span className="tnum rounded-sign bg-line/70 px-2 py-0.5 text-sm font-bold">
                      {option.label}
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">{option.text}</span>

                    {locked && isCorrect && (
                      <span className="ml-auto text-xs font-bold tracking-wide text-correct uppercase">
                        Correct
                      </span>
                    )}
                    {locked && isPicked && !isCorrect && (
                      <span className="ml-auto text-xs font-bold tracking-wide text-incorrect uppercase">
                        You chose
                      </span>
                    )}
                  </span>

                  {locked && (
                    <span className="mt-3 block border-t border-ink/10 pt-3 text-[0.92rem] leading-relaxed text-muted">
                      {option.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
