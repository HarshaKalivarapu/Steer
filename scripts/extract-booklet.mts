/**
 * One-time: transcribe the scanned booklet into docs/booklet.md.
 *
 * Why this exists: the PDF is 47 page scans, which cost ~73k image tokens on every
 * single generation. Text costs a fraction of that, so this pays for itself in about
 * two tests. Re-run it only if the booklet PDF is replaced.
 *
 *   npx tsx scripts/extract-booklet.mts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import { createReadStream, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DOCS = 'docs'
const CACHE = '.cache'
const OUT = path.join(DOCS, 'booklet.md')
const FILES_BETA = 'files-api-2025-04-14'

const EXTRACTION_PROMPT = `Transcribe this Ohio driver's license booklet into clean Markdown.

Rules, in order of importance:

1. NUMBERS ARE THE POINT. Every distance, speed, age, weight, point value, dollar amount,
   BAC figure, and time limit must be transcribed exactly as printed. If a digit is
   genuinely unreadable, write [UNREADABLE] rather than guessing. A wrong number here
   becomes a wrong answer on a practice test, which is worse than a missing one.

2. This is a scan of someone's personal study copy and carries HANDWRITTEN annotations,
   highlighting, and margin notes. Those are a student's notes, not law, and may be
   wrong. Do not merge them into the text. Where one appears, put it on its own line as:
   > [handwritten note: ...]

3. Preserve the document's structure with Markdown headings. Start each page with a
   line "<!-- page N -->" so anything can be traced back to the scan.

4. Transcribe tables as Markdown tables. Keep every row.

5. Where the page shows a road sign as an image, describe it in place as:
   [sign: shape, colour, and what it shows — e.g. "yellow diamond, black arrow curving right"]
   followed by its printed caption or meaning if one is given.

6. Do not summarise, condense, reorder, or improve the wording. This is a transcription.

Begin at page 1 and continue to the end of the document.`

async function main() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY missing. Put it in .env.local.')

  const pdfs = readdirSync(DOCS).filter((f) => f.toLowerCase().endsWith('.pdf'))
  if (pdfs.length !== 1) throw new Error(`Expected exactly one PDF in docs/, found ${pdfs.length}.`)
  const pdfPath = path.join(DOCS, pdfs[0])

  const client = new Anthropic({ timeout: 20 * 60 * 1000, maxRetries: 1 })

  // Reuse the uploaded file if we already have one, so re-runs cost nothing extra.
  if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true })
  const idPath = path.join(CACHE, 'digest-file-id.json')
  let fileId: string
  try {
    fileId = JSON.parse(await readFile(idPath, 'utf8')).id
    console.log('reusing uploaded file:', fileId)
  } catch {
    console.log(`uploading ${pdfs[0]} ...`)
    const up = await client.beta.files.upload({
      file: createReadStream(pdfPath),
      betas: [FILES_BETA],
    })
    fileId = up.id
    await writeFile(idPath, JSON.stringify({ id: fileId }, null, 2))
    console.log('uploaded:', fileId)
  }

  const chunks: string[] = []
  let continuation = ''
  let totalIn = 0
  let totalOut = 0
  let cacheRead = 0
  let cacheWrite = 0

  // The transcript may not fit one response. Two passes of 32k output covers a 47-page
  // booklet with room to spare, and hard-caps the spend at roughly $1.60 of output —
  // a runaway loop here would be an expensive way to find a bug.
  const MAX_PASSES = 2
  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    const instruction =
      pass === 1
        ? EXTRACTION_PROMPT
        : `${EXTRACTION_PROMPT}\n\nYou already transcribed up to and including this text:\n\n"""${continuation}"""\n\nContinue from exactly where that left off. Do not repeat it and do not summarise what came before.`

    const stream = client.beta.messages.stream({
      model: 'claude-opus-5',
      max_tokens: 32000,
      betas: [FILES_BETA],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'document', source: { type: 'file', file_id: fileId } },
            { type: 'text', text: instruction, cache_control: { type: 'ephemeral' } },
          ],
        },
      ],
    })

    const message = await stream.finalMessage()
    const block = message.content.find((b) => b.type === 'text')
    const text = block && block.type === 'text' ? block.text : ''

    chunks.push(text)
    totalIn += message.usage.input_tokens
    totalOut += message.usage.output_tokens
    cacheRead += message.usage.cache_read_input_tokens ?? 0
    cacheWrite += message.usage.cache_creation_input_tokens ?? 0

    console.log(
      `pass ${pass}: ${message.stop_reason} | out ${message.usage.output_tokens} | cache read ${message.usage.cache_read_input_tokens ?? 0}`,
    )

    if (message.stop_reason !== 'max_tokens') break
    if (pass === MAX_PASSES) {
      console.log('\nWARNING: hit the pass limit and the transcript may be truncated.')
    }
    continuation = text.slice(-2000) // tail as the handoff anchor
  }

  const doc = chunks.join('\n')
  await writeFile(OUT, doc, 'utf8')

  const pages = (doc.match(/<!-- page \d+ -->/g) ?? []).length
  const est = (totalIn * 5 + cacheWrite * 6.25 + cacheRead * 0.5 + totalOut * 25) / 1_000_000

  console.log(`\nwrote ${OUT}`)
  console.log(`pages transcribed: ${pages}`)
  console.log(`words: ${doc.split(/\s+/).length}`)
  console.log(
    `tokens — fresh in ${totalIn}, cache write ${cacheWrite}, cache read ${cacheRead}, out ${totalOut}`,
  )
  console.log(`approx cost: $${est.toFixed(2)}`)
  if (pages < 40) console.log('\nWARNING: fewer pages than expected. Check the output before using it.')
}

main().catch((e) => {
  console.error('extraction failed:', e?.message ?? e)
  process.exit(1)
})
