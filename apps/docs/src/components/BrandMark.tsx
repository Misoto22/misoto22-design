/**
 * The site's mark: the favicon, drawn as an element rather than fetched.
 *
 * The same two rounded squares as `app/icon.svg`, and for the same reason —
 * law 2 says a shadow here is never blurred, so the plate below the front
 * square is a solid offset shape. Kept as markup rather than an `<img>` so it
 * follows `currentColor` into the dark theme and onto the one reversed
 * surface; a PNG would need a second file and would still be the wrong ink on
 * one of the two.
 *
 * The front square's fill is the GROUND it sits on, not white: the mark reads
 * as a cut-out, so on paper-2 or on a plate it has to take that colour or it
 * shows as a white patch. Callers pass the ground they are drawing on.
 */
export function BrandMark({
  size = 26,
  ground = 'var(--paper)',
  className,
}: {
  /** Edge length in pixels. 26 in the masthead, 24 on a phone. */
  size?: number
  /** The surface behind the mark, as a CSS colour. */
  ground?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      focusable="false"
      className={className}
    >
      <rect x="11" y="11" width="17" height="17" rx="3" fill="currentColor" />
      <rect
        x="4"
        y="4"
        width="17"
        height="17"
        rx="3"
        fill={ground}
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}
