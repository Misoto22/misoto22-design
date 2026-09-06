import { afterEach, describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Toaster, toast } from './Toast'

/**
 * What these tests can and cannot prove.
 *
 * They prove the MECHANISM: that the Toaster reports the mode this system
 * actually runs on — the `data-mode` attribute a reader can set against their
 * operating system — rather than sonner's default of `light` or its `system`
 * setting, which reads `prefers-color-scheme` and would therefore disagree with
 * the page whenever a reader has overridden the OS.
 *
 * They do NOT prove the contrast that motivated it. sonner's stylesheet sets
 * `[data-description] { color: #3f3f3f }` and overrides it only under
 * `[data-sonner-theme=dark]`; jsdom loads no stylesheet and computes no colour,
 * so the ratio is unmeasurable here. That belongs in the browser suite —
 * `apps/docs/e2e/a11y.spec.ts` — as a dark-mode toast with a description,
 * checked by axe's `color-contrast` rule.
 */
const toaster = (element: HTMLElement) => element.querySelector('[data-sonner-toaster]')

/**
 * sonner mounts its list lazily, so the element under test does not exist until
 * something has been toasted. The description is the half this is all about.
 */
async function mount(element: React.ReactElement) {
  const { baseElement } = render(element)
  toast('Saved', { description: 'Two files written.' })
  await waitFor(() => expect(toaster(baseElement)).not.toBeNull())
  return baseElement
}

afterEach(() => {
  toast.dismiss()
  Reflect.deleteProperty(document.documentElement.dataset, 'mode')
  Reflect.deleteProperty(window, 'matchMedia')
})

describe('Toaster theme', () => {
  it('follows the app into dark', async () => {
    document.documentElement.dataset.mode = 'dark'
    const baseElement = await mount(<Toaster />)

    expect(toaster(baseElement)).toHaveAttribute('data-sonner-theme', 'dark')
  })

  it('is light when the app is', async () => {
    document.documentElement.dataset.mode = 'light'
    const baseElement = await mount(<Toaster />)

    expect(toaster(baseElement)).toHaveAttribute('data-sonner-theme', 'light')
  })

  it('follows a reader who switches with the Toaster already mounted', async () => {
    document.documentElement.dataset.mode = 'light'
    const baseElement = await mount(<Toaster />)

    document.documentElement.dataset.mode = 'dark'

    await waitFor(() =>
      expect(toaster(baseElement)).toHaveAttribute('data-sonner-theme', 'dark'),
    )
  })

  it('follows data-mode and not the operating system', async () => {
    // The reader has overridden a dark OS with a light page. A toast that reads
    // prefers-color-scheme is the same bug in the other direction.
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    document.documentElement.dataset.mode = 'light'
    const baseElement = await mount(<Toaster />)

    expect(toaster(baseElement)).toHaveAttribute('data-sonner-theme', 'light')
  })

  it('lets a caller name the theme themselves', async () => {
    document.documentElement.dataset.mode = 'light'
    const baseElement = await mount(<Toaster theme="dark" />)

    expect(toaster(baseElement)).toHaveAttribute('data-sonner-theme', 'dark')
  })
})

describe('Toaster token style', () => {
  it('does not set custom properties sonner will not read', async () => {
    const baseElement = await mount(<Toaster />)

    // --success-* and --error-* are read only under [data-rich-colors=true].
    // Emitted at the default they are four inert declarations that read, to
    // anyone inspecting the element, as the source of a success toast's colour.
    expect(toaster(baseElement)?.getAttribute('style')).not.toContain('--success-bg')
  })

  it('sets them once rich colours are actually on', async () => {
    const baseElement = await mount(<Toaster richColors />)

    expect(toaster(baseElement)?.getAttribute('style')).toContain('--success-text: var(--ok)')
  })
})
