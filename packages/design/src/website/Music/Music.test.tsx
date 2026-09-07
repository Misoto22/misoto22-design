import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MusicFeature, MediaListRow } from './Music'

describe('media presentation', () => {
  it('invokes the playback boundary only for an available preview', async () => {
    const user = userEvent.setup()
    const toggle = vi.fn()
    const props = { index: 1, title: 'Recording', preview: { label: 'Play Recording', onToggle: toggle } }
    const view = render(<MediaListRow {...props} />)
    await user.click(screen.getByRole('button', { name: 'Play Recording' }))
    expect(toggle).toHaveBeenCalledOnce()
    view.rerender(<MediaListRow {...props} preview={{ ...props.preview, label: 'Preview unavailable', disabled: true }} />)
    await user.click(screen.getByRole('button', { name: 'Preview unavailable' }))
    expect(toggle).toHaveBeenCalledOnce()
  })

  it('keeps genuine progress distinct from a recording without live position data', () => {
    const view = render(<MusicFeature label="Now playing" title="Recording" artworkFallback="No cover" live progress={{ label: 'Playback', value: 30, max: 120, currentLabel: '0:30', endLabel: '2:00' }} />)
    expect(screen.getByRole('progressbar', { name: 'Playback' })).toHaveAttribute('aria-valuenow', '30')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '120')
    view.rerender(<MusicFeature label="Recently played" title="Recording" artworkFallback="No cover" notice="Provider unavailable" />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Provider unavailable')
    expect(screen.getByRole('region', { name: 'Recently played' })).toHaveTextContent('Recording')
  })
})
