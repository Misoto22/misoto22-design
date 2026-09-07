import { useState } from 'react'
import type { MouseEvent, ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionProposal, ConversationRoomLink, ConversationSources, ConversationTurn, QuestionComposer, SelectionToolbar } from './Conversation'

// Flight can defer an element itself, rather than its component type.
function deferredLink(element: ReactElement): ReactElement {
  return {
    $$typeof: Symbol.for('react.lazy'),
    _payload: Promise.resolve(element),
    _init: () => element,
  } as unknown as ReactElement
}

describe('conversation interaction contracts', () => {
  it('replaces deferred source-link content while preserving the host destination and event', async () => {
    const user = userEvent.setup()
    const navigate = vi.fn((event: MouseEvent) => event.preventDefault())
    render(<ConversationSources label="Sources" count="1 source" items={[{
      id: 'source', index: '01', title: 'Source title', detail: 'Supporting detail', kind: 'Article',
      link: deferredLink(<a href="/writing/source" onClick={navigate}>Placeholder</a>),
    }]} />)
    const link = screen.getByRole('link', { name: /^Source title\s*Supporting detail\s*Article$/ })
    expect(link).toHaveAttribute('href', '/writing/source')
    expect(screen.queryByText('Placeholder')).not.toBeInTheDocument()
    await user.click(link)
    expect(navigate).toHaveBeenCalledOnce()
  })

  it('keeps deferred room-link content and appends the decorative arrow', async () => {
    const user = userEvent.setup()
    const navigate = vi.fn((event: MouseEvent) => event.preventDefault())
    render(<ConversationRoomLink>{deferredLink(<a href="/ask" onClick={navigate}>Open room</a>)}</ConversationRoomLink>)
    const link = screen.getByRole('link', { name: 'Open room' })
    expect(link).toHaveAttribute('href', '/ask')
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    await user.click(link)
    expect(navigate).toHaveBeenCalledOnce()
  })

  it('labels the composer and submits through the host boundary', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()
    function Composer() {
      const [value, setValue] = useState('')
      return <QuestionComposer id="question" label="Your question" value={value} onValueChange={setValue} onSubmit={() => submit(value)} maxLength={12} submitLabel="Ask" />
    }
    render(<Composer />)
    const field = screen.getByRole('textbox', { name: 'Your question' })
    await user.type(field, 'How are you?{Enter}')
    expect(submit).toHaveBeenCalledWith('How are you?')
    expect(field).toHaveAttribute('maxlength', '12')
  })

  it('connects the fold control to its body while retaining the preview', async () => {
    const user = userEvent.setup()
    function Turn() {
      const [expanded, setExpanded] = useState(false)
      return <ConversationTurn title="What changed?" expanded={expanded} onToggle={() => setExpanded(!expanded)} bodyId="answer" preview="A short preview">The complete answer.</ConversationTurn>
    }
    render(<Turn />)
    const trigger = screen.getByRole('button', { name: 'What changed?' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('A short preview')).toBeVisible()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', 'answer')
    expect(screen.getByText('The complete answer.')).toBeVisible()
  })

  it('keeps approval separate from showing a proposed destination', async () => {
    const approve = vi.fn()
    const dismiss = vi.fn()
    const user = userEvent.setup()
    render(<ActionProposal label="Suggested page" destination="The project" detail="/projects/example" approveLabel="Open the project" dismissLabel="Stay here" onApprove={approve} onDismiss={dismiss} />)
    expect(approve).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Stay here' }))
    expect(dismiss).toHaveBeenCalledOnce()
    expect(approve).not.toHaveBeenCalled()
  })

  it('uses one toolbar tab stop and skips disabled actions during arrow navigation', async () => {
    const user = userEvent.setup()
    render(<SelectionToolbar label="Selected passage" floating actions={[
      { id: 'explain', label: 'Explain', onSelect: vi.fn() },
      { id: 'translate', label: 'Translate', onSelect: vi.fn(), disabled: true },
      { id: 'ask', label: 'Ask', onSelect: vi.fn() },
    ]} />)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Explain' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveAttribute('tabindex', '-1')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Explain' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Ask' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('button', { name: 'Explain' })).toHaveFocus()
  })
})
