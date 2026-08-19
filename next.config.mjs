/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep these out of the bundler so the route uses the real undici and the real
  // SDK at runtime. Bundling them was what produced the connection errors on long
  // streaming responses.
  serverExternalPackages: ['undici', '@anthropic-ai/sdk'],

  /*
    `next build` and `next dev` share .next/ by default, so running a build while a dev
    server is up overwrites the chunks the dev server has already loaded and it starts
    failing with "Cannot find module './NNN.js'". Setting NEXT_DIST_DIR sends a build
    somewhere else, which is what `npm run check` does. Deploys are unaffected: with the
    variable unset this stays on the default.
  */
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

export default nextConfig
