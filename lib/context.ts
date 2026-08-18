import { readFile } from 'node:fs/promises'
import path from 'node:path'

const DOCS = path.join(process.cwd(), 'docs')

export async function readSeedBank(): Promise<string> {
  return readFile(path.join(DOCS, 'EXAMPLE_QUESTIONS.md'), 'utf8')
}

/**
 * The transcribed booklet. Generation used to attach the PDF itself, but that is 47
 * page scans costing ~73k image tokens on every call; the transcript is ~23k text
 * tokens and reads the same. Regenerate it with `npm run extract` if the PDF changes.
 */
export async function readBooklet(): Promise<string> {
  try {
    return await readFile(path.join(DOCS, 'booklet.md'), 'utf8')
  } catch {
    throw new Error('docs/booklet.md is missing. Run `npm run extract` to create it.')
  }
}
