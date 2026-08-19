import { NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { anthropicClient } from '@/lib/anthropic'
import { readBooklet, readSeedBank } from '@/lib/context'
import { SYSTEM_PROMPT, buildSeedPrompt, buildTaskPrompt } from '@/lib/prompt'
import { findInternalDuplicates, findRepeatsOf } from '@/lib/dedup'
import { BATCH_SIZE, LETTERS, type Question, type Section } from '@/lib/types'
import { SIGN_IDS } from '@/lib/signs'
import { mockQuestions } from '@/lib/mock'

export const runtime = 'nodejs'
// A 5-question batch measures around 27 seconds. 60 is Vercel's Hobby ceiling and
// leaves better than 2x headroom; going bigger is what would blow the limit.
export const maxDuration = 60

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
 * Structured outputs can't express counts, cross-field rules, or uniqueness, so
 * everything the schema can't guarantee is checked here.
 */
function validate(
  questions: Question[],
  section: Section,
  count: number,
  avoid: string[],
  avoidSigns: string[],
) {
  if (questions.length !== count) {
    throw new Error(`Expected ${count} questions, got ${questions.length}.`)
  }
  const strays = questions.filter((q) => q.section !== section).length
  if (strays > 0) throw new Error(`${strays} question(s) came back in the wrong section.`)

  for (const q of questions) {
    if (q.options.length !== 4) throw new Error(`"${q.prompt}" has ${q.options.length} options.`)
    if (!q.options.some((o) => o.label === q.answer)) {
      throw new Error(`"${q.prompt}" has answer ${q.answer} with no matching option.`)
    }
  }

  const withSigns = questions.filter((q) => q.signId !== 'none')
  for (const q of withSigns) {
    if (q.section !== 'signs') {
      throw new Error(`"${q.prompt}" shows a sign but is filed under rules.`)
    }
  }
  // Roughly a third of each signs batch should show real artwork.
  const minImages = section === 'signs' ? Math.max(1, Math.floor(count / 3)) : 0
  if (withSigns.length < minImages) {
    throw new Error(
      `Only ${withSigns.length} question(s) show a sign; at least ${minImages} required.`,
    )
  }

  // Image questions are deduped by the sign they show, not by their wording — every
  // "What does this sign mean?" stem reads alike no matter which sign is on screen.
  const shown = withSigns.map((q) => q.signId)
  const repeatedSign = shown.find((sid, i) => shown.indexOf(sid) !== i)
  if (repeatedSign) throw new Error(`The sign "${repeatedSign}" is used twice.`)
  const staleSign = shown.find((sid) => avoidSigns.includes(sid))
  if (staleSign) throw new Error(`The sign "${staleSign}" was already used.`)

  // Only text questions get compared by wording.
  const prompts = questions.filter((q) => q.signId === 'none').map((q) => q.prompt)

  const internal = findInternalDuplicates(prompts)
  if (internal.length > 0) {
    throw new Error(
      `${internal.length} duplicated question(s), e.g. "${internal[0].a}" vs "${internal[0].b}".`,
    )
  }

  const repeats = findRepeatsOf(prompts, avoid)
  if (repeats.length > 0) {
    throw new Error(`${repeats.length} question(s) repeat an earlier one, e.g. "${repeats[0].a}".`)
  }
}

async function generateSection(
  client: Anthropic,
  section: Section,
  count: number,
  reference: string,
  avoid: string[],
  avoidSigns: string[],
) {
  const stream = client.beta.messages.stream({
    model: 'claude-opus-5',
    max_tokens: 24000,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: QUESTION_SCHEMA } },
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
  let avoid: string[] = []
  let avoidSigns: string[] = []
  let examId = crypto.randomUUID()

  try {
    const body = (await request.json()) as Record<string, unknown>
    if (body.section === 'rules') section = 'rules'
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

    let lastError: Error | undefined
    let exclusions = avoid

    /*
      A retry is only worth starting if there is time left for it to finish. Each
      attempt runs 30-40 seconds and the function is capped at 60, so retrying at
      the 35-second mark just guarantees a timeout instead of returning the error.
    */
    const deadlineMs = (maxDuration - 8) * 1000

    for (let attempt = 1; attempt <= 2; attempt++) {
      const attemptStarted = Date.now()
      const batch = await generateSection(
        client,
        section,
        count,
        reference,
        exclusions,
        avoidSigns,
      )
      const took = Date.now() - attemptStarted
      const questions: Question[] = batch.questions.map((q, i) => ({
        ...q,
        id: `${examId}-${section}-${Date.now()}-${i}`,
      }))

      try {
        validate(questions, section, count, avoid, avoidSigns)
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        const elapsed = Date.now() - started
        const room = elapsed + took < deadlineMs
        console.log(
          `[generate] ${section} x${count} attempt ${attempt} REJECTED in ${took}ms ` +
            `(${elapsed}ms elapsed) — ${lastError.message}` +
            (attempt < 2 && !room ? ' — no time to retry' : ''),
        )
        if (!room) break
        exclusions = [...exclusions, ...questions.map((q) => q.prompt)]
        continue
      }

      const { cacheWrite, cacheRead, out } = batch.usage
      console.log(
        `[generate] ${section} x${count} attempt ${attempt} ok in ${took}ms ` +
          `(total ${Date.now() - started}ms) — cache write ${cacheWrite}, read ${cacheRead}, out ${out}`,
      )
      return NextResponse.json({ questions })
    }

    throw lastError ?? new Error('Could not produce a valid batch.')
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Unknown error'
    console.log(`[generate] ${section} x${count} FAILED after ${Date.now() - started}ms — ${detail}`)
    return new NextResponse(`Could not generate questions. ${detail}`, { status: 500 })
  }
}
