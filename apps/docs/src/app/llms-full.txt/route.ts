import { fullText } from '@/lib/agent-text'

export const dynamic = 'force-static'

export function GET() {
  return new Response(fullText(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
