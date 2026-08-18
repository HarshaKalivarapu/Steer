/**
 * Checks for the duplicate detector. Run with: npm test
 *
 * The pairs below are real ones from the seed bank, so if you retune
 * DUPLICATE_THRESHOLD this tells you immediately what you broke.
 */
import { DUPLICATE_THRESHOLD, findInternalDuplicates, findRepeatsOf } from './dedup.ts'

/** Reworded versions of the same question. Must be flagged. */
const DUPLICATES: [string, string][] = [
  [
    'A flashing red traffic signal at an intersection has the same requirements as which of the following?',
    'A **flashing red** traffic signal should be treated the same as:',
  ],
  [
    'When two vehicles arrive at an intersection at the same time, which one has the right-of-way when no signs or signals indicate rules?',
    'Two vehicles arrive at a four-way stop at exactly the same time. Right-of-way goes to:',
  ],
  [
    'When is a driver permitted to turn right on a red traffic signal?',
    'Unless a sign prohibits it, you may turn **right on red** in Ohio:',
  ],
]

/** Different questions, some on adjacent topics. Must NOT be flagged. */
const DISTINCT: [string, string][] = [
  [
    'Unless a sign prohibits it, you may turn right on red in Ohio:',
    'In Ohio you may turn left on a red light:',
  ],
  [
    'Unless it is posted otherwise, the speed limit in a residential area is:',
    'In Ohio you must turn on your headlights:',
  ],
  [
    'A solid yellow line on your side of the center line means:',
    'A solid white line between lanes of traffic moving in the same direction means:',
  ],
  [
    'What is the most important driving technique to avoid crashes when driving in icy or snowy conditions?',
    'Your car begins to hydroplane on a wet road. You should:',
  ],
  [
    'A driver under 21 in Ohio can be charged with OVI at a blood alcohol concentration of:',
    'If someone has consumed alcoholic drinks, what will help the person overcome the influence of those drinks?',
  ],
]

/**
 * Known blind spot, asserted so it stays visible rather than being rediscovered later.
 * These test the same school-bus rule but share almost no vocabulary, so word overlap
 * cannot see it. The prompt's exclusion list is what covers this case.
 */
const KNOWN_MISS: [string, string] = [
  'When traveling on a highway divided into four traffic lanes, which vehicles are required to stop for a school bus that has stopped to unload children?',
  'You are on a road with **four or more lanes**. A school bus stops with red lights flashing on the **opposite** side. You must:',
]

let failures = 0

function check(label: string, pass: boolean, detail: string) {
  if (!pass) failures++
  console.log(`  ${pass ? 'pass' : 'FAIL'}  ${label}  ${detail}`)
}

console.log(`threshold ${DUPLICATE_THRESHOLD}\n`)

console.log('flags reworded duplicates:')
for (const [a, b] of DUPLICATES) {
  const hits = findRepeatsOf([a], [b])
  check('', hits.length === 1, `${hits[0]?.score.toFixed(2) ?? '----'}  ${a.slice(0, 50)}`)
}

console.log('\nleaves distinct questions alone:')
for (const [a, b] of DISTINCT) {
  const hits = findRepeatsOf([a], [b])
  check('', hits.length === 0, `${hits[0]?.score.toFixed(2) ?? '----'}  ${a.slice(0, 50)}`)
}

console.log('\ninternal duplicates within one test:')
const internal = findInternalDuplicates([DUPLICATES[0][0], DUPLICATES[0][1], DISTINCT[1][0]])
check('', internal.length === 1, `${internal.length} pair(s) flagged, expected 1`)

console.log('\nknown blind spot (documented, not a regression):')
const miss = findRepeatsOf([KNOWN_MISS[0]], [KNOWN_MISS[1]])
check('', miss.length === 0, 'same-rule pair still slips through word overlap')

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
