/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep these out of the bundler so the route uses the real undici and the real
  // SDK at runtime. Bundling them was what produced the connection errors on long
  // streaming responses.
  serverExternalPackages: ['undici', '@anthropic-ai/sdk'],
}

export default nextConfig
