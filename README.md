# Ohio Permit Practice

A practice-test app for the Ohio BMV knowledge exam. Click **Generate Test**, get 40
questions, answer them one at a time with an explanation under every option, and see a
score at the end. Past tests are kept so they can be read back.

## Running it

```bash
npm install
cp .env.example .env.local   # then paste your key into .env.local
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` set, **Generate Test** returns a placeholder test — enough to
click through the interface, not real study material. Every placeholder question is
prefixed `[Sample]`.

## How a test gets made

`POST /api/generate` sends Claude the transcribed booklet (`docs/booklet.md`), the seed
question bank (`docs/EXAMPLE_QUESTIONS.md`), and the sign catalogue. It asks for a strict
JSON schema back, then checks the result before saving — 40 questions, split 20/20 between
signs and rules, four options each, an answer that matches one of them, and at least four
questions showing a real sign image. If any of that fails the request errors rather than
handing over a broken test.

### Generated in small batches

Questions arrive five at a time, for two reasons. Vercel caps a serverless function at
60 seconds on the Hobby tier, and a measured 5-question batch takes about 27 seconds
against roughly 148 for twenty — so five leaves real headroom rather than a five-second
margin. It also means she starts answering sooner.

- **Starter** — one batch per section, fired in parallel, so 10 questions in ~30s. This
  is all she waits for.
- **The rest** — the exam page tops the test up five at a time while she answers. Each
  completed batch triggers the next, so the loop drives itself until both sections reach
  20. Eight requests in total.

If she catches up to the generator, the Next button reads "Writing the next questions…"
rather than pretending the test has ended. A failed batch stops the loop after two
attempts, so a persistent error can't quietly spend money in the background.

`maxDuration` in the route is set to 60 to match the Hobby ceiling. Raise it if you
deploy somewhere with a longer limit, but the batch size is what actually keeps requests
short.

### Sign images

Signs are drawn as inline SVG in `lib/signs.ts`. To replace a drawing with a real image,
drop a file into `public/signs/` named after the sign id (`stop.png`, `curve-right.jpg`).
The manifest rebuilds before `dev` and `build`; use `npm run signs` if the server is
already running. `/signs` shows every sign and whether it's using your image or a drawing.

The model never supplies artwork — it picks an id from the catalogue and the app draws it,
so a question can't reference a sign that doesn't exist.

### Cost

`npm run extract` reads the booklet's text layer straight into `docs/booklet.md` — free,
exact, and no OCR step that could misread a digit. Re-run it only if the PDF is replaced.

If you ever swap in a booklet that is a *scan* with no text layer, the script says so and
`npm run extract:ocr` pays a model to read the pages instead (~$1.86 for 47 pages).

`docs/` keeps both manuals. Only the one matching `SOURCE_HINT` in
`scripts/extract-booklet.py` is used; the other is reference.

Model is set in `app/api/generate/route.ts`. `claude-sonnet-5` would cut per-test cost to
roughly half if the question quality holds up.

## Not repeating questions

Two mechanisms, because one isn't enough:

1. **The exclusion list.** Every request carries the full text of all questions from the
   last three tests, and the prompt tells the model to test different facts — including
   skipping seed questions that appear there. This is the part that actually works on
   reworded repeats.
2. **A validation backstop** (`lib/dedup.ts`). Compares content-word overlap and rejects
   the test if any two questions in it, or any question against the last three tests,
   score above 0.30. A rejected test is retried once with the offenders added to the
   exclusion list.

The backstop catches literal and near-literal repeats. It does **not** catch two questions
on the same rule written in completely different words — measured, documented at the top
of `lib/dedup.ts`, and asserted as a known blind spot in the tests. Run `npm test` after
touching the threshold; the test pairs are real ones from the seed bank.

## Adding questions

Open [docs/EXAMPLE_QUESTIONS.md](docs/EXAMPLE_QUESTIONS.md) and paste yours in using the
format at the top. The more seed questions there are, the less the model has to invent.

**Only add questions from official or published Ohio sources.** This file is the style and
difficulty target — its measured stats (15-word stems, 5-word options) are quoted directly
in the prompt. A question written from scratch to fill a gap pulls generated tests away
from what the real exam looks like rather than toward it.

The bank is currently short on `signs` questions, and every test needs 20 of them.

## Scoring

The real Ohio exam scores its two halves separately and needs 15/20 on each, so a strong
half won't cover a weak one. The score screen reports both sections independently and
calls it a pass only when both clear 15.

## Where things live

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Home — the Generate Test button |
| `app/exam/[id]/page.tsx` | Taking a test: one question at a time, running tally, score |
| `app/history/page.tsx` | Past tests |
| `app/api/generate/route.ts` | Calls Claude, validates, returns an exam |
| `lib/prompt.ts` | The system prompt and test structure rules |
| `lib/types.ts` | Exam/question shapes and the section-scoring logic |
| `lib/storage.ts` | localStorage read/write — answers are write-once |
| `lib/dedup.ts` | Duplicate detection, plus its limits |
| `docs/` | The Digest PDF and the seed question bank |

Tests are stored in the browser's `localStorage`, so they live on whichever device took
them. There's no account and no server-side database — it's a one-person app.
