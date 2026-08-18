import Anthropic from '@anthropic-ai/sdk'
import { Agent, fetch as undiciFetch } from 'undici'

/**
 * Next patches the global fetch, and its timeouts cut long streaming responses off
 * part-way — a section takes two to three minutes to generate and was dying with an
 * opaque "terminated" error. So the client is given undici's own fetch plus a
 * dispatcher with the idle timeouts disabled, bypassing the patched global entirely.
 */
const dispatcher = new Agent({
  headersTimeout: 0, // no cap on time-to-first-byte
  bodyTimeout: 0, // no cap on gaps between chunks
  keepAliveTimeout: 60_000,
  connect: { timeout: 60_000 },
})

export function anthropicClient(): Anthropic {
  return new Anthropic({
    timeout: 15 * 60 * 1000,
    maxRetries: 1,
    fetch: ((url: string, init?: RequestInit) =>
      undiciFetch(url, { ...init, dispatcher } as never)) as unknown as typeof fetch,
  })
}
