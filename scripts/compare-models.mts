/**
 * A/B two models on the exact same question-generation request.
 *
 * Everything is held constant except the model string: same system prompt, same booklet
 * and seed bank, same schema, same count, same max_tokens, no exclusions. Both models
 * default to adaptive thinking at high effort, so those are left untouched too. The runs
 * are sequential so neither is competing for bandwidth with the other.
 *
 *   npx tsx scripts/compare-models.mts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import { readFile, writeFile } from 'node:fs/promises'
import { SYSTEM_PROMPT, buildSeedPrompt, buildTaskPrompt } from '../lib/prompt.ts'
import { SIGN_IDS } from '../lib/signs.ts'
import { LETTERS, type Question } from '../lib/types.ts'

const SECTION = 'rules' as const
const COUNT = 5
const MAX_TOKENS = 8000
const OUT = 'docs/model-comparison.md'

// $ per million tokens: [input, output, cache write, cache read]
const PRICES: Record<string, [number, number, number, number]> = {
  'claude-opus-5': [5, 25, 6.25, 0.5],
  'claude-sonnet-5': [3, 15, 3.75, 0.3],
}

const SCHEMA = {
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

interface Run {
  model: string
  questions: Question[]
  seconds: number
  cost: number
  usage: { in: number; out: number; cacheWrite: number; cacheRead: number }
}

async function run(client: Anthropic, model: string, reference: string): Promise<Run> {
  const started = Date.now()
  const stream = client.messages.stream({
    model,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: reference, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: buildTaskPrompt(SECTION, COUNT, [], []) },
        ],
      },
    ],
  })

  const message = await stream.finalMessage()
  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error(`${model}: no text returned`)

  const u = {
    in: message.usage.input_tokens,
    out: message.usage.output_tokens,
    cacheWrite: message.usage.cache_creation_input_tokens ?? 0,
    cacheRead: message.usage.cache_read_input_tokens ?? 0,
  }
  const [pi, po, pw, pr] = PRICES[model]
  const cost = (u.in * pi + u.out * po + u.cacheWrite * pw + u.cacheRead * pr) / 1_000_000

  return {
    model,
    questions: (JSON.parse(block.text) as { questions: Question[] }).questions,
    seconds: Math.round((Date.now() - started) / 1000),
    cost,
    usage: u,
  }
}

function stats(qs: Question[]) {
  const stem = qs.map((q) => q.prompt.split(/\s+/).length)
  const opt = qs.flatMap((q) => q.options.map((o) => o.text.split(/\s+/).length))
  const why = qs.flatMap((q) => q.options.map((o) => o.why.split(/\s+/).length))
  const mean = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1)
  return { stem: mean(stem), opt: mean(opt), why: mean(why), maxOpt: Math.max(...opt) }
}

function render(r: Run): string {
  const s = stats(r.questions)
  const lines = [
    `## ${r.model}`,
    '',
    `${r.seconds}s · $${r.cost.toFixed(3)} · stems ${s.stem} words · options ${s.opt} words ` +
      `(longest ${s.maxOpt}) · explanations ${s.why} words`,
    '',
  ]
  r.questions.forEach((q, i) => {
    lines.push(`**${i + 1}. [${q.difficulty}]** ${q.prompt}`, '')
    for (const o of q.options) {
      lines.push(`- ${o.label}) ${o.text}${o.label === q.answer ? '  ← **correct**' : ''}`)
      lines.push(`  - *${o.why}*`)
    }
    lines.push('')
  })
  return lines.join('\n')
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY missing.')

  const [booklet, seedBank] = await Promise.all([
    readFile('docs/booklet.md', 'utf8'),
    readFile('docs/EXAMPLE_QUESTIONS.md', 'utf8'),
  ])
  const reference = buildSeedPrompt(booklet, seedBank)
  const client = new Anthropic({ timeout: 15 * 60 * 1000, maxRetries: 1 })

  const runs: Run[] = []
  for (const model of ['claude-opus-5', 'claude-sonnet-5']) {
    process.stdout.write(`${model} ... `)
    const r = await run(client, model, reference)
    console.log(`${r.seconds}s, $${r.cost.toFixed(3)}, ${r.questions.length} questions`)
    runs.push(r)
  }

  const header = [
    '# Model comparison',
    '',
    `Same prompt, same booklet and seed bank, same schema, ${COUNT} \`${SECTION}\` questions,`,
    `\`max_tokens: ${MAX_TOKENS}\`, no exclusions. Only the model string differs.`,
    '',
    '| model | time | cost | stem words | option words | explanation words |',
    '| --- | --- | --- | --- | --- | --- |',
    ...runs.map((r) => {
      const s = stats(r.questions)
      return `| ${r.model} | ${r.seconds}s | $${r.cost.toFixed(3)} | ${s.stem} | ${s.opt} | ${s.why} |`
    }),
    '',
    'Seed bank targets: stems ~15 words, options ~5 words, explanations ~13 words.',
    '',
  ].join('\n')

  await writeFile(OUT, header + runs.map(render).join('\n'), 'utf8')
  console.log(`\ntotal $${runs.reduce((a, r) => a + r.cost, 0).toFixed(3)} — wrote ${OUT}`)
}

main().catch((e) => {
  console.error('comparison failed:', e?.message ?? e)
  process.exit(1)
})
