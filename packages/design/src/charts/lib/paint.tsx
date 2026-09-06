'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { ChartConfig } from './chart'
import { colorStops } from './chart'

/**
 * The intro wipe's direction, shared by every mark that has one.
 *
 * Named for the DATA rather than for the screen. `forward` runs from the first
 * row to the last, `reverse` the other way — which is the thing the author
 * actually means, and stays true in a right-to-left document, where a cartesian
 * plot is still drawn first-row-first.
 *
 * `"none"` opts out, and is also what a device with the OS reduce-motion
 * preference falls back to: a reveal is a per-frame animated SVG mask, the
 * heaviest thing in the package and the least welcome to a reader who has
 * asked for stillness.
 */
export type ChartRevealType = 'none' | 'forward' | 'reverse' | 'center-out' | 'edges-in'

/** A reveal that actually plays. */
export type ChartRevealDirection = Exclude<ChartRevealType, 'none'>

/** The intro wipe, in seconds. */
export const REVEAL_DURATION = 1

/**
 * The wipe's curve. Not `--ease`: the system's easing is tuned for a control
 * moving a few pixels, and over a full plot width it arrives too abruptly.
 * A long, flat tail is what makes a line read as being drawn.
 */
export const REVEAL_EASE: [number, number, number, number] = [0, 0.7, 0.5, 1]

/** The edge a single-rect wipe grows from: 0 the start, 1 the end, 0.5 the middle. */
const REVEAL_ORIGIN: Record<Exclude<ChartRevealDirection, 'edges-in'>, number> = {
  forward: 0,
  reverse: 1,
  'center-out': 0.5,
}

/**
 * The mask that draws a line or an area in.
 *
 * One mask covers the mark's fill, its stroke AND its resting dots, so the
 * three arrive together. Drawn separately — which is what Recharts' own
 * animation does — the dots pop in before the line reaches them.
 *
 * Both `maskUnits` and `maskContentUnits` are user space so every masked
 * element shares one coordinate system and the wipe edge lands at the same x
 * on each of them.
 */
export function RevealMask({ id, type }: { id: string; type: ChartRevealDirection }) {
  const reveal = {
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: REVEAL_DURATION, ease: REVEAL_EASE },
  }

  return (
    <mask
      id={`${id}-reveal-mask`}
      maskUnits="userSpaceOnUse"
      maskContentUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="100%"
      height="100%"
    >
      {type === 'edges-in' ? (
        <>
          <motion.rect
            {...reveal}
            x="0"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 0 }}
          />
          <motion.rect
            {...reveal}
            x="50%"
            y="0"
            width="50%"
            height="100%"
            fill="white"
            style={{ originX: 1 }}
          />
        </>
      ) : (
        <motion.rect
          {...reveal}
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="white"
          style={{ originX: REVEAL_ORIGIN[type] }}
        />
      )}
    </mask>
  )
}

export interface PaintProps {
  /** The owning mark's id, which scopes every definition below. */
  id: string
  /** The series being painted. */
  dataKey: string
}

/**
 * The one gradient everything else is masked out of.
 *
 * Every fill variant, every stroke and every dot in a chart paints from this,
 * which is what makes a series a single visual object rather than a set of
 * elements that happen to share a colour. A series with one colour still gets a
 * two-stop gradient: it keeps the paint reference identical across variants, so
 * switching a series from one colour to three changes no other code.
 */
export function SeriesGradient({
  id,
  dataKey,
  config,
  direction = 'horizontal',
  gradientUnits,
}: PaintProps & {
  config: ChartConfig
  /** Horizontal reads along the axis; vertical reads up the mark. */
  direction?: 'horizontal' | 'vertical'
  gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox'
}) {
  const stops = colorStops(config[dataKey])
  const axis =
    direction === 'vertical'
      ? { x1: '0', y1: '0', x2: '0', y2: '1' }
      : { x1: '0', y1: '0', x2: '1', y2: '0' }

  return (
    <linearGradient id={`${id}-colors-${dataKey}`} {...axis} gradientUnits={gradientUnits}>
      <ColorStops dataKey={dataKey} stops={stops} />
    </linearGradient>
  )
}

/**
 * The stops themselves, so a variant can build its own gradient from them.
 *
 * `opacities` ramps the stops independently of their colour — a radar's fill
 * fades from its centre outward without needing a second gradient to mask it.
 */
export function ColorStops({
  dataKey,
  stops,
  opacities,
}: {
  dataKey: string
  stops: number
  opacities?: number[]
}) {
  if (stops === 1) {
    return (
      <>
        <stop offset="0%" stopColor={`var(--color-${dataKey}-0)`} stopOpacity={opacities?.[0]} />
        <stop
          offset="100%"
          stopColor={`var(--color-${dataKey}-0)`}
          stopOpacity={opacities?.[opacities.length - 1]}
        />
      </>
    )
  }

  return (
    <>
      {Array.from({ length: stops }, (_, index) => {
        const offset = `${(index / (stops - 1)) * 100}%`
        return (
          <stop
            key={offset}
            offset={offset}
            stopColor={`var(--color-${dataKey}-${index}, var(--color-${dataKey}-0))`}
            stopOpacity={opacities?.[index]}
          />
        )
      })}
    </>
  )
}

/**
 * A texture, expressed once.
 *
 * Every fill variant in the package has the same three parts: a texture, a mask
 * built from it, and a pattern that paints the series gradient through that
 * mask. Writing those three out per variant — which is how this arrived — meant
 * six near-identical twenty-line blocks per chart type and four chart types
 * that each had their own copy.
 */
function MaskedFill({
  name,
  id,
  dataKey,
  texture,
  patternUnits = 'userSpaceOnUse',
  patternContentUnits,
  size = { width: '100%', height: '100%' },
  maskContentUnits,
  fill,
}: PaintProps & {
  /** The variant's name, which becomes its paint reference. */
  name: string
  /** The mask's contents — white shows the series through, black hides it. */
  texture: ReactNode
  patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox'
  patternContentUnits?: 'userSpaceOnUse' | 'objectBoundingBox'
  size?: { width: string | number; height: string | number }
  maskContentUnits?: 'userSpaceOnUse' | 'objectBoundingBox'
  /** The paint the mask reveals. Defaults to the series gradient. */
  fill?: string
}) {
  const maskId = `${id}-${name}-mask-${dataKey}`
  const paint = fill ?? `url(#${id}-colors-${dataKey})`

  return (
    <>
      <mask id={maskId} maskContentUnits={maskContentUnits}>
        {texture}
      </mask>
      <pattern
        id={`${id}-${name}-${dataKey}`}
        patternUnits={patternUnits}
        patternContentUnits={patternContentUnits}
        width={size.width}
        height={size.height}
      >
        <rect
          x="0"
          y="0"
          width={size.width}
          height={size.height}
          fill={paint}
          mask={`url(#${maskId})`}
        />
      </pattern>
    </>
  )
}

/* ── Area fills ───────────────────────────────────────────────────────────
   Six ways an area meets the plot, and in the monochrome default they are the
   PRIMARY way two series are told apart — the ramp is the second encoding. */

/** Solid at the top, dissolving toward the axis. The default. */
export function AreaGradientFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <linearGradient id={`${id}-area-gradient-fade-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="var(--chart-fill)" />
        <stop offset="100%" stopColor="white" stopOpacity={0} />
      </linearGradient>
      <MaskedFill
        name="gradient"
        id={id}
        dataKey={dataKey}
        texture={
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-area-gradient-fade-${dataKey})`}
          />
        }
      />
    </>
  )
}

/** The same fade, run the other way — heavier where it meets the axis. */
export function AreaGradientReverseFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <linearGradient id={`${id}-area-reverse-fade-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity={0} />
        <stop offset="100%" stopColor="white" stopOpacity="var(--chart-fill)" />
      </linearGradient>
      <MaskedFill
        name="gradient-reverse"
        id={id}
        dataKey={dataKey}
        texture={
          <rect width="100%" height="100%" fill={`url(#${id}-area-reverse-fade-${dataKey})`} />
        }
      />
    </>
  )
}

/** One flat wash, no fade. Reads as a band rather than as a slope. */
export function AreaSolidFill({ id, dataKey }: PaintProps) {
  return (
    <MaskedFill
      name="solid"
      id={id}
      dataKey={dataKey}
      texture={<rect width="100%" height="100%" fill="white" fillOpacity="var(--chart-fill)" />}
    />
  )
}

/** A field of dots. The lightest texture, and the one that stacks best. */
export function AreaDottedFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <pattern
        id={`${id}-area-dotted-texture-${dataKey}`}
        x="0"
        y="0"
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="4" cy="4" r="0.5" fill="white" />
      </pattern>
      <MaskedFill
        name="dotted"
        id={id}
        dataKey={dataKey}
        texture={
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-area-dotted-texture-${dataKey})`}
            fillOpacity="var(--chart-texture)"
          />
        }
      />
    </>
  )
}

/** Diagonal rule lines, 45°. */
export function AreaLinesFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <pattern
        id={`${id}-area-lines-texture-${dataKey}`}
        patternUnits="userSpaceOnUse"
        width="5"
        height="5"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="5" stroke="white" strokeWidth="1" />
      </pattern>
      <MaskedFill
        name="lines"
        id={id}
        dataKey={dataKey}
        texture={
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-area-lines-texture-${dataKey})`}
            fillOpacity="var(--chart-texture)"
          />
        }
      />
    </>
  )
}

/** Wide soft-edged stripes at 20°. The heaviest of the six. */
export function AreaHatchedFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <linearGradient id={`${id}-area-hatched-stripe-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="50%" stopColor="white" stopOpacity={0.2} />
        <stop offset="50%" stopColor="white" stopOpacity={1} />
      </linearGradient>
      <pattern
        id={`${id}-area-hatched-texture-${dataKey}`}
        x="0"
        y="0"
        width="20"
        height="10"
        patternUnits="userSpaceOnUse"
        overflow="visible"
        patternTransform="rotate(20)"
      >
        <rect width="20" height="10" fill={`url(#${id}-area-hatched-stripe-${dataKey})`} />
      </pattern>
      <MaskedFill
        name="hatched"
        id={id}
        dataKey={dataKey}
        texture={
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-area-hatched-texture-${dataKey})`}
            fillOpacity="var(--chart-texture)"
          />
        }
      />
    </>
  )
}

/**
 * What a series looks like when another one is selected.
 *
 * A thin diagonal rule rather than a lower opacity: opacity alone makes a
 * series faint, and a faint area on a white ground is still an area. The
 * texture change is what makes it read as "not this one".
 */
export function UnselectedFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <pattern
        id={`${id}-unselected-texture-${dataKey}`}
        patternUnits="userSpaceOnUse"
        width="5"
        height="5"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="5" stroke="white" strokeWidth="1" />
      </pattern>
      <MaskedFill
        name="unselected"
        id={id}
        dataKey={dataKey}
        texture={
          <rect
            width="100%"
            height="100%"
            fill={`url(#${id}-unselected-texture-${dataKey})`}
            fillOpacity="var(--chart-texture)"
          />
        }
      />
    </>
  )
}

/* ── Bar fills ────────────────────────────────────────────────────────────
   A bar is a solid block, so its textures are denser than an area's — the eye
   has less of it to read and the mark can carry more. */

/** 45° stripes over a faint ground. */
export function BarHatchedFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <pattern
        id={`${id}-bar-hatched-texture-${dataKey}`}
        x="0"
        y="0"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <rect width="5" height="5" fill="white" fillOpacity={0.3} />
        <rect width="1.5" height="5" fill="white" fillOpacity={1} />
      </pattern>
      <MaskedFill
        name="hatched"
        id={id}
        dataKey={dataKey}
        texture={<rect width="100%" height="100%" fill={`url(#${id}-bar-hatched-texture-${dataKey})`} />}
      />
    </>
  )
}

/**
 * Stripes with nothing behind them — the projected, not-yet-real part of a
 * series. Used by the last bar when `buffer` is set.
 */
export function BarBufferFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <pattern
        id={`${id}-bar-buffer-texture-${dataKey}`}
        x="0"
        y="0"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-45)"
      >
        <rect width="5" height="5" fill="black" fillOpacity={0} />
        <rect width="1" height="5" fill="white" fillOpacity={1} />
      </pattern>
      <MaskedFill
        name="buffer"
        id={id}
        dataKey={dataKey}
        texture={<rect width="100%" height="100%" fill={`url(#${id}-bar-buffer-texture-${dataKey})`} />}
      />
    </>
  )
}

/**
 * A bar split down its own middle, one half at full weight.
 *
 * Everything here is in object-bounding-box units so the split lands at each
 * bar's centre rather than at the plot's — in user space a narrow bar at the
 * right of the chart would be entirely on one side of the seam.
 */
export function BarDuotoneFill({
  id,
  dataKey,
  config,
  reverse = false,
}: PaintProps & { config: ChartConfig; reverse?: boolean }) {
  const name = reverse ? 'duotone-reverse' : 'duotone'
  const stops = colorStops(config[dataKey])

  return (
    <>
      <linearGradient
        id={`${id}-${name}-split-${dataKey}`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        <stop offset="50%" stopColor="white" stopOpacity={reverse ? 1 : 0.4} />
        <stop offset="50%" stopColor="white" stopOpacity={reverse ? 0.4 : 1} />
      </linearGradient>
      <linearGradient
        id={`${id}-${name}-colors-${dataKey}`}
        gradientUnits="objectBoundingBox"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >
        <ColorStops dataKey={dataKey} stops={stops} />
      </linearGradient>
      <MaskedFill
        name={name}
        id={id}
        dataKey={dataKey}
        patternUnits="objectBoundingBox"
        patternContentUnits="objectBoundingBox"
        maskContentUnits="objectBoundingBox"
        size={{ width: 1, height: 1 }}
        fill={`url(#${id}-${name}-colors-${dataKey})`}
        texture={
          <rect
            x="0"
            y="0"
            width="1"
            height="1"
            fill={`url(#${id}-${name}-split-${dataKey})`}
          />
        }
      />
    </>
  )
}

/** Solid at the top of the bar, dissolving toward the baseline. */
export function BarGradientFill({ id, dataKey }: PaintProps) {
  return (
    <>
      <linearGradient id={`${id}-bar-gradient-fade-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="20%" stopColor="white" stopOpacity={1} />
        <stop offset="90%" stopColor="white" stopOpacity={0} />
      </linearGradient>
      <MaskedFill
        name="gradient"
        id={id}
        dataKey={dataKey}
        texture={<rect width="100%" height="100%" fill={`url(#${id}-bar-gradient-fade-${dataKey})`} />}
      />
    </>
  )
}

/**
 * A faint body under a solid cap, drawn by the bar shape itself.
 *
 * The variant that survives density best: at twenty bars a solid block becomes
 * a wall, and a 2px cap over a wash still reads as twenty distinct values.
 */
export function BarStrippedFill({ id, dataKey }: PaintProps) {
  return (
    <MaskedFill
      name="stripped"
      id={id}
      dataKey={dataKey}
      texture={<rect width="100%" height="100%" fill="white" fillOpacity="var(--chart-fill)" />}
    />
  )
}

/**
 * The halo behind a highlighted mark.
 *
 * The one blur in the package, and it is a filter on a MARK rather than a
 * box-shadow under a panel — law 2 bans the second, not the first. It exists
 * because a monochrome chart has no "brighter" to reach for when one series has
 * to be the point of the figure.
 *
 * A line needs a wider, stronger halo than a bar: a 0.8px stroke has almost no
 * area to bleed from, where a bar has its whole face.
 */
export function GlowFilter({
  id,
  dataKey,
  spread = 8,
  intensity = 0.5,
}: PaintProps & {
  /** Blur radius, in user units. */
  spread?: number
  /** Alpha multiplier on the blurred copy. Above 1 saturates it. */
  intensity?: number
}) {
  return (
    <filter id={`${id}-glow-${dataKey}`} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={spread} result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values={`1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${intensity} 0`}
        result="glow"
      />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

/**
 * A dashed stroke that crawls along its own path.
 *
 * SMIL rather than CSS, because the two attributes have to stay in lockstep and
 * a CSS animation on `stroke-dasharray` is not interpolated the same way in
 * every engine. It is composed as a CHILD of the mark, so a caller that does
 * not ask for it pays nothing — and `keyframes.css`'s reduced-motion rule
 * cannot reach SMIL, which is why the call sites gate it on `useReducedMotion`
 * instead.
 */
export function AnimatedDashedStroke({ dash = 3 }: { dash?: number }) {
  return (
    <>
      <animate
        attributeName="stroke-dasharray"
        values={`${dash} ${dash}; 0 ${dash}; ${dash} ${dash}`}
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;0.5;1"
      />
      <animate
        attributeName="stroke-dashoffset"
        values={`0; -${dash * 2}`}
        dur="1s"
        repeatCount="indefinite"
        keyTimes="0;1"
      />
    </>
  )
}
