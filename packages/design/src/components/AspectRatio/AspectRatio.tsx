import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Width over height. A number (`16 / 9`) or the CSS form (`'16 / 9'`).
   *
   * It is a style rather than a class because Tailwind can only generate what
   * it can read verbatim in the source, and this value arrives at runtime.
   */
  ratio?: number | string
  children?: ReactNode
}

/**
 * A box that keeps its shape whatever is inside it.
 *
 * The one layout primitive that is genuinely hard to hand-roll. The `padding-
 * top: 56.25%` trick everyone reaches for is a percentage of the WIDTH, which
 * is why it works at all and also why it silently breaks the moment the box is
 * a flex or grid child — and it takes the element's own padding with it. The
 * modern `aspect-ratio` property does the same job in one line, and only holds
 * if nothing inside forces a height, which is what the absolute positioning
 * below guarantees.
 *
 * So: the box declares the ratio, and every direct child is stretched to fill
 * it and taken out of flow. That means a child with no intrinsic size at all —
 * an empty `<div>`, a map that measures its container, a skeleton — still gets
 * the full box, and an `<img>` or `<video>` is cropped to cover it rather than
 * letterboxed. Content that must not be cropped should set `object-contain` on
 * itself.
 *
 * Reach for this when the height must be known before the content loads: a
 * media grid that would otherwise reflow every time an image arrives is the
 * usual case, and that reflow is the layout shift a Core Web Vitals score is
 * measuring.
 *
 * @example
 * <AspectRatio ratio={16 / 9}><img src={cover} alt="" /></AspectRatio>
 * @example
 * <AspectRatio ratio="1 / 1" className="rounded-(--radius) border border-(--rule-2)">
 *   <Skeleton />
 * </AspectRatio>
 */
export function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  children,
  ...rest
}: AspectRatioProps) {
  const box: CSSProperties = { aspectRatio: String(ratio), ...style }

  return (
    <div
      style={box}
      className={cn(
        'relative w-full overflow-hidden',
        // Every direct child fills the box, so nothing inside can push the
        // height around and break the ratio the box just declared.
        '[&>*]:absolute [&>*]:inset-0 [&>*]:size-full',
        '[&>img]:object-cover [&>video]:object-cover',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default AspectRatio
