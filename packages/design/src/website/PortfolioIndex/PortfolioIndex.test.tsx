import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PortfolioIndex } from './PortfolioIndex'

describe('PortfolioIndex', () => {
  it('switches content and its category context with the keyboard', async () => {
    const user = userEvent.setup()
    render(<PortfolioIndex label="Explore" items={[{ value: 'work', label: 'Work', count: 3, content: 'Projects', aside: 'Project categories' }, { value: 'writing', label: 'Writing', count: 2, content: 'Posts', aside: 'Post categories' }]} />)
    await user.click(screen.getByRole('tab', { name: 'Work 3' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Writing 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Posts')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Post categories')
    expect(screen.queryByText('Project categories')).not.toBeInTheDocument()
  })
})
