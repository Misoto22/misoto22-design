import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClipboardButton, CodePanel } from './CodePanel'

describe('CodePanel clipboard boundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('copies the rendered highlighted text, including line breaks', async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<CodePanel languageLabel="Shell" copyLabel="Copy code" copiedLabel="Copied"><code><span>printf hello</span>{'\n'}<span>printf world</span>{'\n'}</code></CodePanel>)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(write).toHaveBeenCalledWith('printf hello\nprintf world')
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    expect(screen.getByText('printf hello').closest('pre')).toHaveAttribute('tabindex', '0')
  })

  it('does not report success after the browser rejects a clipboard write', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'))
    render(<ClipboardButton text="example" copyLabel="Copy code" copiedLabel="Copied" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument()
  })

  it('accepts highlighted children inside a pre-existing renderer figure', () => {
    const { container } = render(<figure data-renderer="mdx"><CodePanel framed={false} languageLabel="TypeScript" copyLabel="Copy" copiedLabel="Copied" preProps={{ 'aria-label': 'Example' }}><code>const a = 1</code></CodePanel></figure>)
    expect(container.querySelectorAll('figure')).toHaveLength(1)
    expect(screen.getByText('const a = 1').closest('pre')).toHaveAttribute('aria-label', 'Example')
  })
})
