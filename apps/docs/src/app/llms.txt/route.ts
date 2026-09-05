import { indexText } from '@/lib/agent-text'

/** Emitted at build time; `output: 'export'` has no runtime to emit it in. */
export const dynamic = 'force-static'

export function GET() {
  return new Response(indexText(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
