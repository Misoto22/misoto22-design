'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export interface IndicatorStyle {
  /** Distance from the container's inline start, in pixels. */
  offset: number
  width: number
  height: number
  top: number
  /** False until the first measurement, so the pill does not fly in from 0. */
  ready: boolean
}

/**
 * Measures the selected child so a single pill can slide between options
 * instead of one filled background switching off while another switches on.
 *
 * Why measure rather than animate each option's own background: a colour that
 * cross-fades reads as two things changing, and a shape that travels reads as
 * one thing moving — which is what actually happened. It is also the only way
 * to get the movement onto the compositor, since `background-color` cannot be
 * transformed.
 *
 * `useLayoutEffect` and not `useEffect`: the measurement has to land in the
 * same frame as the render that caused it, or the pill visibly starts from its
 * old place on first paint.
 *
 * Re-measures on resize and whenever `key` changes — `key` being whatever makes
 * the selection different, usually the selected value.
 */
export function useSelectionIndicator<T extends HTMLElement>(
  key: string | null,
): [React.RefObject<T | null>, IndicatorStyle] {
  const containerRef = useRef<T>(null)
  const [style, setStyle] = useState<IndicatorStyle>({
    offset: 0,
    width: 0,
    height: 0,
    top: 0,
    ready: false,
  })

  const measure = useCallback(() => {
    const container = containerRef.current
    const selected = container?.querySelector<HTMLElement>('[data-indicator-active="true"]')
    if (!container || !selected) {
      setStyle((previous) => ({ ...previous, ready: false }))
      return
    }
    // `offsetLeft` and friends, not `getBoundingClientRect`.
    //
    // The rect is in VISUAL pixels: inside a zoomed or scaled ancestor — a
    // thumbnail, a device preview — it comes back multiplied, while the
    // `transform` this feeds is interpreted in the element's own coordinate
    // space. The pill then landed short of its segment by exactly the scale
    // factor. The offset properties are layout values and are unaffected.
    //
    // Offsets are relative to `offsetParent`, which is usually the strip itself
    // but need not be, so they are accumulated up to the container rather than
    // read once.
    let offset = 0
    let top = 0
    for (
      let node: HTMLElement | null = selected;
      node && node !== container;
      node = node.offsetParent as HTMLElement | null
    ) {
      offset += node.offsetLeft
      top += node.offsetTop
    }

    setStyle({
      // Physical `left`, not `inline-start`: the pill is positioned with
      // `transform`, which is physical, and the measurement has to match. It
      // comes out right in both directions because both sides of the
      // subtraction flip together.
      offset,
      width: selected.offsetWidth,
      height: selected.offsetHeight,
      top,
      ready: true,
    })
  }, [])

  useLayoutEffect(() => {
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [key, measure])

  return [containerRef, style]
}
