import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetWarnings } from '../../lib/warn'
import { Article } from './Article'

describe('Article with both html and children', () => {
  let warned: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarnings()
    warned = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warned.mockRestore()
  })

  const message = () => warned.mock.calls.map((call) => String(call[0])).join('\n')

  it('says so when children are dropped for html', () => {
    render(
      <Article html="<p>From the pipeline.</p>">
        <p>Written by hand.</p>
      </Article>,
    )

    // The comment in the source already said a page with both is a page with
    // two Articles "and it should say so". Nothing said so.
    expect(warned).toHaveBeenCalled()
    expect(message()).toContain('ARTICLE_HTML_AND_CHILDREN')
    expect(message()).toContain('field: html')
    expect(screen.queryByText('Written by hand.')).not.toBeInTheDocument()
  })

  it('says so for an empty html string too, which is the quietest way to lose them', () => {
    render(
      <Article html="">
        <p>Written by hand.</p>
      </Article>,
    )

    expect(message()).toContain('ARTICLE_HTML_AND_CHILDREN')
  })

  it('stays quiet for html on its own', () => {
    render(<Article html="<p>From the pipeline.</p>" />)

    expect(warned).not.toHaveBeenCalled()
  })

  it('stays quiet for children on their own', () => {
    render(
      <Article>
        <p>Written by hand.</p>
      </Article>,
    )

    expect(warned).not.toHaveBeenCalled()
  })

  it('does not mistake a child that decided not to render for a second Article', () => {
    const showNote = false
    render(<Article html="<p>From the pipeline.</p>">{showNote && <p>Note</p>}</Article>)

    expect(warned).not.toHaveBeenCalled()
  })
})
