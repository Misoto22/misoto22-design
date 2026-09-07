import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuestionCard } from './QuestionCard'

describe('QuestionCard', () => {
  it('names the asking region from its heading and submits its question', async () => {
    const submit = vi.fn()
    const user = userEvent.setup()
    render(
      <QuestionCard
        title="Ask the archive"
        description="Answers grounded in the available work."
        label="Your question"
        placeholder="What would you like to know?"
        value="Which projects are featured?"
        onChange={vi.fn()}
        onSubmit={submit}
        submitLabel="Ask"
        examplesLabel="Suggested questions"
        examples={['What has changed?']}
      />,
    )

    expect(screen.getByRole('region', { name: 'Ask the archive' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    expect(submit).toHaveBeenCalledWith('Which projects are featured?')
  })
})
