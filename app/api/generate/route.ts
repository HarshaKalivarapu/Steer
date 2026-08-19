import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { anthropicClient } from '@/lib/anthropic'
import { readBooklet, readSeedBank } from '@/lib/context'
import { SYSTEM_PROMPT, buildSeedPrompt, buildTaskPrompt } from '@/lib/prompt'
import { findInternalDuplicates, findRepeatsOf } from '@/lib/dedup'
import { BATCH_SIZE, LETTERS, type Question, type Section } from '@/lib/types'
import { SIGN_IDS } from '@/lib/signs'
import { mockQuestions } from '@/lib/mock'

/*
  How hard the model thinks before writing, which is the single biggest lever on how long
  a request takes. Time tracks output volume at roughly 12ms per token, and Opus's
  thinking counts toward output: a batch measured 45s at 'high' against 15s at 'medium',
  for near-identical questions.

  The two callers want different things, so they get different settings:

  - The exam runs at 'high'. These are the questions she actually answers, and the extra
    deliberation is what produces distractors drawn from real rules misapplied rather
    than throwaways. Measured 1 hollow distractor in 15 at 'high', versus 3 in 15 for
    the cheaper model at 'medium'.
  - The pool runs at 'medium'. It only has to be ready before she presses Start, and a
    15s refill beats a 45s one for that. It is also the path that runs on a cold start,
    where speed is the whole point.

  The level is decided here rather than sent by the client, so a request can't ask for
  an arbitrary one.
*/
const EFFORT = {
  exam: 'high',
  pool: 'medium',
} as const

type Purpose = keyof typeof EFFORT

export const runtime = 'nodejs'
// A 5-question batch measures around 27 seconds. 60 is Vercel's Hobby ceiling and
// leaves better than 2x headroom; going bigger is what would blow the limit.
/*
  How long this function is allowed to run.

  This is a request, not a platform constant, and it is what actually produced the
  "Task timed out after 60 seconds" errors — Vercel was honouring the 60 we asked for,
  not imposing it. Fluid Compute (the default on new projects) allows 300 across plans
  and can be configured higher.

  If a deploy is ever rejected for this value, Fluid Compute is switched off on the
  project: either enable it in Settings > Functions, or set this back to 60. With effort
  at medium a batch measures around 15 seconds, so 60 is already generous — this is
  headroom for a slow run, not something the normal path needs.
*/
export const maxDuration = 300

const QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section: { type: 'string', enum: ['signs', 'rules'] },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          prompt: { type: 'string' },
          answer: { type: 'string', enum: LETTERS },
          // Always present. 'none' means a text-only question.
          signId: { type: 'string', enum: [...SIGN_IDS, 'none'] },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', enum: LETTERS },
                text: { type: 'string' },
                why: { type: 'string' },
              },
              required: ['label', 'text', 'why'],
              additionalProperties: false,
            },
          },
        },
        required: ['section', 'difficulty', 'prompt', 'options', 'answer', 'signId'],
        additionalProperties: false,
      },
    },
  },
  required: ['questions'],
  additionalProperties: false,
} as const

/**
 * Splits a batch into the questions worth keeping and the reasons for the rest.
 *
 * Duplicates used to fail the whole batch, which meant one repeated question threw away
 * four good ones and cost another 35-second request. Since the client tops up until the
 * test is full, a short batch is barely a cost — so anything malformed or repeated is
 * dropped and the remainder returned. Only an empty result is an error.
 */
function screen(
  questions: Question[],
  section: Section,
  avoid: string[],
  avoidSigns: string[],
): { keep: Question[]; dropped: string[] } {
  const keep: Question[] = []
  const dropped: string[] = []

  // Signs already spoken for, including ones earlier in this same batch.
  const usedSigns = new Set(avoidSigns)
  // Text questions kept so far, so a batch can't repeat itself either.
  const keptPrompts: string[] = []

  for (const q of questions) {
    if (q.section !== section) {
      dropped.push('wrong section')
      continue
    }
    if (q.options.length !== 4 || !q.options.some((o) => o.label === q.answer)) {
      dropped.push('malformed options')
      continue
    }

    if (q.signId !== 'none') {
      if (usedSigns.has(q.signId)) {
        dropped.push(`sign "${q.signId}" already used`)
        continue
      }
      usedSigns.add(q.signId)
      keep.push(q)
      continue
    }

    // Image questions are compared by the sign they show; text ones by wording.
    if (findRepeatsOf([q.prompt], [...avoid, ...keptPrompts]).length > 0) {
      dropped.push(`repeat: "${q.prompt.slice(0, 60)}"`)
      continue
    }
    if (findInternalDuplicates([...keptPrompts, q.prompt]).length > 0) {
      dropped.push(`duplicate within batch: "${q.prompt.slice(0, 60)}"`)
      continue
    }
    keptPrompts.push(q.prompt)
    keep.push(q)
  }

  return { keep, dropped }
}

async function generateSection(
  client: Anthropic,
  section: Section,
  count: number,
  purpose: Purpose,
  reference: string,
  avoid: string[],
  avoidSigns: string[],
) {
  const stream = client.beta.messages.stream({
    model: 'claude-opus-5',
    // Ample for a 3-question batch, which runs well under 2k tokens of JSON. Kept
    // bounded so a runaway generation fails fast rather than burning the whole budget.
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: EFFORT[purpose],
      format: { type: 'json_schema', schema: QUESTION_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: reference,
            // Booklet + seed bank are byte-identical on every request, so the cache
            // breakpoint goes here. The exclusion list below must stay outside it.
            cache_control: { type: 'ephemeral' },
          },
          { type: 'text', text: buildTaskPrompt(section, count, avoid, avoidSigns) },
        ],
      },
    ],
  })

  const message = await stream.finalMessage()

  if (message.stop_reason === 'max_tokens') {
    throw new Error(`The ${section} batch was cut off before it finished.`)
  }

  const text = message.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') throw new Error(`No ${section} questions came back.`)

  const { questions } = JSON.parse(text.text) as { questions: Omit<Question, 'id'>[] }
  // The model is told which half to write, but the section field is what the app
  // scores on, so pin it rather than trusting it.
  return {
    questions: questions.map((q) => ({ ...q, section })),
    usage: {
      cacheWrite: message.usage.cache_creation_input_tokens ?? 0,
      cacheRead: message.usage.cache_read_input_tokens ?? 0,
      out: message.usage.output_tokens,
    },
  }
}

export async function POST(request: Request) {
  const started = Date.now()
  let section: Section = 'signs'
  let count = BATCH_SIZE
  let purpose: Purpose = 'exam'
  let avoid: string[] = []
  let avoidSigns: string[] = []
  let examId = crypto.randomUUID()

  try {
    const body = (await request.json()) as Record<string, unknown>
    if (body.section === 'rules') section = 'rules'
    if (body.purpose === 'pool') purpose = 'pool'
    if (typeof body.count === 'number' && body.count > 0) {
      count = Math.min(Math.floor(body.count), BATCH_SIZE)
    }
    if (typeof body.examId === 'string') examId = body.examId
    if (Array.isArray(body.avoid)) {
      avoid = body.avoid.filter((p): p is string => typeof p === 'string')
    }
    if (Array.isArray(body.avoidSigns)) {
      avoidSigns = body.avoidSigns.filter((p): p is string => typeof p === 'string')
    }
  } catch {
    // no body sent — a default signs batch with nothing to avoid
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ questions: mockQuestions(examId, section, count) })
  }

  try {
    const client = anthropicClient()
    const [booklet, seedBank] = await Promise.all([readBooklet(), readSeedBank()])
    const reference = buildSeedPrompt(booklet, seedBank)

    const attemptStarted = Date.now()
    const batch = await generateSection(
      client,
      section,
      count,
      purpose,
      reference,
      avoid,
      avoidSigns,
    )
    const took = Date.now() - attemptStarted

    const withIds: Question[] = batch.questions.map((q, i) => ({
      ...q,
      id: `${examId}-${section}-${Date.now()}-${i}`,
    }))
    const { keep, dropped } = screen(withIds, section, avoid, avoidSigns)

    const { cacheWrite, cacheRead, out } = batch.usage
    console.log(
      `[generate] ${section} x${count} -> ${keep.length} kept in ${took}ms ` +
        `— ${purpose}/${EFFORT[purpose]}, cache write ${cacheWrite}, read ${cacheRead}, out ${out}` +
        (dropped.length ? ` — dropped ${dropped.length}: ${dropped.join('; ')}` : ''),
    )

    if (keep.length === 0) {
      throw new Error(
        dropped.length ? `Every question was rejected — ${dropped[0]}` : 'No questions returned.',
      )
    }

    return NextResponse.json({ questions: keep })
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Unknown error'
    console.log(
      `[generate] ${section} x${count} ${purpose} FAILED after ${Date.now() - started}ms — ${detail}`,
    )
    return new NextResponse(`Could not generate questions. ${detail}`, { status: 500 })
  }
}
