/**
 * Duplicate detection for generated questions.
 *
 * Exact string matching is not enough: a model asked twice for a test on the same
 * booklet will produce "A flashing red signal means you must:" and "A flashing red
 * traffic signal requires a driver to:", which are one question in two costumes. So we
 * compare content-word overlap and reject anything above a threshold.
 *
 * WHAT THIS CATCHES, AND WHAT IT DOES NOT. Measured against real pairs from the seed
 * bank, reworded-but-identical questions score 0.33-0.63 while genuinely distinct ones
 * top out at 0.25, so the threshold below reliably catches literal and near-literal
 * repeats. It does NOT catch two questions on the same fact written in entirely
 * different words — the pair "which vehicles must stop for a school bus on a four-lane
 * highway" and "a bus stops on the opposite side of a four-lane road, you must" scores
 * 0.20, below a distinct pair. Word overlap cannot see that they are the same rule.
 *
 * So this is a backstop, not the main defence. The primary mechanism is the exclusion
 * list in the prompt, which hands the model the full text of every recent question and
 * tells it to pick different facts. This function exists to catch the case where the
 * model ignores that instruction outright.
 */

// Words that carry no distinguishing signal in a traffic-law question.
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'you', 'your',
  'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from',
  'that', 'this', 'these', 'those', 'it', 'its', 'as', 'when', 'what', 'which', 'who',
  'must', 'should', 'may', 'can', 'do', 'does', 'have', 'has', 'will', 'would',
  'following', 'means', 'mean', 'meaning', 'driver', 'drivers', 'vehicle', 'ohio',
])

function contentWords(prompt: string): Set<string> {
  const words = prompt
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
  return new Set(words)
}

/** Jaccard overlap of content words: 1 means identical vocabulary, 0 means disjoint. */
function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const w of a) if (b.has(w)) shared++
  return shared / (a.size + b.size - shared)
}

/**
 * Set from measured scores: lowest reworded-duplicate pair was 0.33, highest genuinely
 * distinct pair was 0.25. 0.30 sits in that gap. Raise it if real questions start
 * getting rejected; lower it only with fresh measurements, since the margin is thin.
 */
export const DUPLICATE_THRESHOLD = 0.3

export interface DuplicatePair {
  a: string
  b: string
  score: number
}

/** Duplicates *within* one set of questions. Returns every offending pair. */
export function findInternalDuplicates(prompts: string[]): DuplicatePair[] {
  const words = prompts.map(contentWords)
  const found: DuplicatePair[] = []
  for (let i = 0; i < prompts.length; i++) {
    for (let j = i + 1; j < prompts.length; j++) {
      const score = overlap(words[i], words[j])
      if (score >= DUPLICATE_THRESHOLD) {
        found.push({ a: prompts[i], b: prompts[j], score })
      }
    }
  }
  return found
}

/** Questions that repeat something from a previous test. */
export function findRepeatsOf(prompts: string[], previous: string[]): DuplicatePair[] {
  const previousWords = previous.map(contentWords)
  const found: DuplicatePair[] = []
  for (const prompt of prompts) {
    const words = contentWords(prompt)
    for (let i = 0; i < previous.length; i++) {
      const score = overlap(words, previousWords[i])
      if (score >= DUPLICATE_THRESHOLD) {
        found.push({ a: prompt, b: previous[i], score })
        break // one hit is enough to reject it
      }
    }
  }
  return found
}
