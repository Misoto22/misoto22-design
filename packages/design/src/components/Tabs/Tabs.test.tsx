import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

function Example(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return <Tabs defaultValue="one" {...props}><TabsList aria-label="Install"><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="disabled" disabled>Disabled</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one"><p>First panel</p><pre>Copy this command</pre></TabsContent><TabsContent value="two">Second panel</TabsContent></Tabs>
}
function swipe(element: HTMLElement, dx = -100, dy = 0) {
  fireEvent.touchStart(element, { touches: [{ clientX: 150, clientY: 100 }] })
  fireEvent.touchEnd(element, { changedTouches: [{ clientX: 150 + dx, clientY: 100 + dy }] })
}
describe('Tabs motion interactions', () => {
  it('keeps click and keyboard selection, skipping disabled tabs', async () => {
    const user = userEvent.setup()
    render(<Example />)
    await user.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel')
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })
  it('swipes between enabled panels without wrapping at the boundary', () => {
    render(<Example />)
    swipe(screen.getByText('First panel'))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel')
    swipe(screen.getByRole('tabpanel'))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel')
    swipe(screen.getByRole('tabpanel'), 100)
    expect(screen.getByRole('tabpanel')).toHaveTextContent('First panel')
  })
  it('preserves code selection, vertical scrolling and cancelled gestures', () => {
    render(<Example />)
    swipe(screen.getByText('Copy this command'))
    swipe(screen.getByText('First panel'), -20, 100)
    const panel = screen.getByRole('tabpanel')
    fireEvent.touchStart(panel, { touches: [{ clientX: 150, clientY: 100 }] })
    fireEvent.touchCancel(panel)
    fireEvent.touchEnd(panel, { changedTouches: [{ clientX: 0, clientY: 100 }] })
    expect(panel).toHaveTextContent('First panel')
  })
  it('reports controlled changes without replacing the host value', () => {
    const change = vi.fn()
    render(<Example value="one" onValueChange={change} />)
    swipe(screen.getByText('First panel'))
    expect(change).toHaveBeenCalledWith('two')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('First panel')
  })
  it('reports a click once and supports manual keyboard activation', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    render(<Example onValueChange={change} activationMode="manual" />)
    await user.click(screen.getByRole('tab', { name: 'Two' }))
    expect(change).toHaveBeenCalledTimes(1)
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second panel')
    await user.keyboard('{Enter}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('First panel')
  })
  it('allows consumers to disable swiping', () => {
    render(<Example swipe={false} />)
    swipe(screen.getByText('First panel'))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('First panel')
  })
})
