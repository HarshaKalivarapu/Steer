/**
 * Type-check and build into a scratch directory, so it is safe to run while
 * `npm run dev` is going. Building into .next while the dev server is live
 * clobbers the chunks it has loaded and breaks the running app.
 */
import { spawnSync } from 'node:child_process'

const env = { ...process.env, NEXT_DIST_DIR: '.next-check' }
const run = (cmd, args) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: true, env }).status ?? 1

process.exit(run('npx', ['next', 'build']))
