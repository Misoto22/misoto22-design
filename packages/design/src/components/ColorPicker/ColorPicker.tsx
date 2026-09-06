'use client'

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react'
import { cn } from '../../lib/cn'
import {
  clamp,
  colorFormat,
  colorToRgb,
  fitGamut,
  formatColor,
  maxChroma,
  parseColor,
  type Color,
  type ColorFormat,
  type ColorSpace,
} from '../../lib/color'
import { CONTROL_BASE, CONTROL_BORDER, isInvalid } from '../../lib/control'
import { warnBlankName } from '../../lib/warn'
import { useFieldControl } from '../Field/field-control'
import { Input } from '../Input/Input'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover/Popover'
import { ToggleGroup, ToggleGroupItem } from '../ToggleGroup/ToggleGroup'

/** The plane's pixel grid. Wider than it is tall, like the panel holding it. */
const PLANE_W = 256
const PLANE_H = 160

/** Hue stops in the strip behind the hue slider. Every 5°, plus the wrap. */
const HUE_STOPS = 73

const BLACK: Color = { l: 0, c: 0, h: 0, a: 1 }

const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: 'Hex',
  oklch: 'OKLCH',
  // Not "Display P3": the three segments share the strip evenly, and the long
  // name wraps to two lines inside its third and makes the whole row twice as
  // tall as the two beside it.
  p3: 'P3',
}

/**
 * A checkerboard, so alpha reads as alpha rather than as a lighter colour.
 *
 * Sized per surface: 8px checks read as a texture behind a full-width track and
 * as two grey squares inside a 16px swatch.
 */
const checkerboard = (square: string) =>
  `repeating-conic-gradient(var(--stone) 0% 25%, var(--paper) 0% 50%) 0 0 / ${square} ${square}`

export interface ColorPickerProps {
  /**
   * Names the control. Required — the trigger shows a colour, and a colour is
   * not a name.
   *
   * Announced together with the value, the way `Select`'s is: a reader hears
   * "Brand colour, #a78bfa". Inside a `Field` with a label, that label is used
   * and this one is not repeated.
   */
  label: string
  /** The colour, as any absolute CSS colour string. */
  value?: string
  defaultValue?: string
  /**
   * Fires with a CSS colour string in whichever notation the panel is set to —
   * so the notation a caller passes in is the notation they get back until
   * somebody changes it in the panel.
   */
  onValueChange?: (value: string) => void
  disabled?: boolean
  /** Paints the resting border with `--danger` and reflects `aria-invalid`. */
  invalid?: boolean
  className?: string
  /** The TRIGGER's id — the element a label points at. A `Field` sets it. */
  id?: string
  /** Ids of the copy describing the control. A `Field` sets it from hint, error and description. */
  'aria-describedby'?: string
  /** The spelling a form library sets; read together with `invalid`. */
  'aria-invalid'?: boolean | 'true' | 'false'
  /** Announced on the trigger. A `Field` sets it from `required`. */
  'aria-required'?: boolean
}

/**
 * A colour, chosen or typed.
 *
 * The panel works in OKLCH, and that is the reason to reach for this rather
 * than `<input type="color">`. In HSV — which is what the native picker and
 * most libraries use — dragging along a row of constant "lightness" walks
 * through colours the eye reads as getting darker, so a reader tuning a palette
 * is fighting the instrument. OKLCH's lightness is the one a person sees, so
 * two colours at the same height on the plane genuinely match, and the hue
 * strip stays at the lightness already chosen instead of showing a rainbow that
 * belongs to some other colour.
 *
 * The plane is normalised to the gamut ROW BY ROW: its right edge is the most
 * chroma that exists at that lightness and hue, so the whole surface is
 * reachable rather than a lens of colour inside a field of clipped duplicates.
 *
 * **What it accepts.** Hex, `rgb()`, `hsl()`, `oklch()` and
 * `color(display-p3 …)`, in both syntaxes. Named colours are not accepted:
 * resolving them needs a table of every CSS name or a live DOM, and a box that
 * takes "rebeccapurple" but not "papayawhip" is worse than one that takes
 * neither.
 *
 * **Keyboard.** The plane is a group of two real sliders — chroma across,
 * lightness up — so the arrows move it and a screen reader announces where it
 * is. That is the part a 2D canvas usually leaves out, and leaving it out makes
 * the control unusable rather than merely awkward.
 *
 * @example
 * <Field label="Brand colour"><ColorPicker label="Brand colour" defaultValue="#a78bfa" /></Field>
 */
export function ColorPicker({
  label,
  value: controlled,
  defaultValue = '#000000',
  onValueChange,
  disabled,
  invalid,
  className,
  id,
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: ColorPickerProps) {
  warnBlankName('ColorPicker', 'label', label, 'the trigger is announced with no name')
  const bad = isInvalid(invalid, ariaInvalid)

  const field = useFieldControl()
  const generated = useId()
  const triggerId = id ?? generated
  const valueId = `${triggerId}-value`
  const nameId = field?.labelId ?? `${triggerId}-name`

  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = controlled ?? uncontrolled

  const [color, setColor] = useState<Color>(() => parseColor(defaultValue) ?? BLACK)
  const [format, setFormat] = useState<ColorFormat>(() => colorFormat(defaultValue))
  // What this component last wrote out, so its own emission does not read back
  // as an outside change and re-derive the hue it just preserved.
  const emitted = useRef<string | null>(null)

  // The plane's horizontal position, kept across the two rows where it cannot
  // be derived: at pure black and pure white every chroma is zero, so `c / max`
  // is 0/0 and the handle would jump to the left edge on the way past.
  const saturationRef = useRef(0)

  useEffect(() => {
    if (value === emitted.current) return
    const parsed = parseColor(value)
    if (!parsed) return
    // A grey has no hue — only the angle of its rounding error. Keeping the
    // last real one is what stops the strip spinning when a reader drags the
    // handle through the neutral column.
    setColor((prev) => ({ ...parsed, h: parsed.c < 1e-7 ? prev.h : parsed.h }))
    setFormat(colorFormat(value))
  }, [value])

  // Hex is bounded to sRGB; both of the others can address the wider gamut, so
  // the plane shows what the notation can actually hold.
  const space: ColorSpace = format === 'hex' ? 'srgb' : 'p3'
  const ceiling = maxChroma(color.l, color.h, space)
  const saturation = ceiling > 0 ? clamp(color.c / ceiling) : saturationRef.current

  useEffect(() => {
    if (ceiling > 0) saturationRef.current = saturation
  }, [ceiling, saturation])

  const commit = (next: Color, nextFormat: ColorFormat = format) => {
    const fitted = nextFormat === 'oklch' ? next : fitGamut(next, nextFormat === 'p3' ? 'p3' : 'srgb')
    setColor(fitted)
    setFormat(nextFormat)
    const text = formatColor(fitted, nextFormat)
    emitted.current = text
    if (controlled === undefined) setUncontrolled(text)
    onValueChange?.(text)
  }

  /** Moves the plane handle, in the 0–1 coordinates the plane is drawn in. */
  const setPlane = (nextSaturation: number, lightness: number) => {
    saturationRef.current = nextSaturation
    commit({ ...color, l: lightness, c: nextSaturation * maxChroma(lightness, color.h, space) })
  }

  const planeRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const painted = useRef<string>('')

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = planeRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    setPlane(
      clamp((event.clientX - rect.left) / rect.width),
      clamp(1 - (event.clientY - rect.top) / rect.height),
    )
  }

  /**
   * Fills the plane, at most once per hue.
   *
   * Called from the canvas's own ref callback rather than only from an effect,
   * because the canvas does not exist until the panel is open AND Radix's
   * popper has measured it — which is a commit later than the one that opened
   * it. An effect keyed to the open state runs on the commit BEFORE the node
   * arrives, finds a ref holding null, and never runs again: a plane that
   * stayed blank until the reader happened to move the hue.
   */
  const paint = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const key = `${color.h.toFixed(3)}:${space}`
    if (painted.current === key) return
    const context = canvas.getContext('2d')
    // A headless environment can hand back a 2D context with most of the
    // drawing surface missing. Nothing here is load-bearing — the plane is the
    // pointer's aim, and the two sliders under it work either way — so a
    // partial context means no plane rather than a thrown render.
    if (!context || typeof context.createImageData !== 'function') return
    painted.current = key

    const pixels = context.createImageData(PLANE_W, PLANE_H)
    for (let y = 0; y < PLANE_H; y++) {
      const l = 1 - y / (PLANE_H - 1)
      // Each row is normalised to its OWN reachable chroma. Painted against one
      // global maximum instead, the top and bottom thirds of the plane are
      // bands of clipped duplicates a reader can never pick apart.
      const rowMax = maxChroma(l, color.h, space)
      for (let x = 0; x < PLANE_W; x++) {
        const rgb = colorToRgb({ l, c: (x / (PLANE_W - 1)) * rowMax, h: color.h, a: 1 }, 'srgb')
        const at = (y * PLANE_W + x) * 4
        for (let channel = 0; channel < 3; channel++) {
          pixels.data[at + channel] = Math.round(clamp(rgb[channel] ?? 0) * 255)
        }
        pixels.data[at + 3] = 255
      }
    }
    context.putImageData(pixels, 0, 0)
  }

  /** Repaints a canvas that is already on screen when the hue moves under it. */
  useEffect(() => {
    paint(canvasRef.current)
  })

  const opaque = formatColor({ ...color, a: 1 }, 'oklch')
  const hueTrack = Array.from({ length: HUE_STOPS }, (_, i) => {
    const h = i * (360 / (HUE_STOPS - 1))
    return formatColor({ l: color.l, c: saturation * maxChroma(color.l, h, space), h, a: 1 }, 'oklch')
  }).join(', ')

  const typed = parseColor(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={triggerId}
          disabled={disabled}
          // Named by the label AND by its own value, in that order — the same
          // arrangement Select uses, and for the same reason: `aria-label`
          // outranks the content, so naming it "Brand colour" would tell a
          // reader the noun and never the answer.
          aria-labelledby={`${nameId} ${valueId}`}
          aria-describedby={describedBy}
          aria-required={ariaRequired}
          aria-invalid={bad || undefined}
          className={cn(
            CONTROL_BASE,
            bad ? CONTROL_BORDER.invalid : CONTROL_BORDER.resting,
            'flex cursor-pointer items-center gap-2.5 text-start',
            className,
          )}
        >
          {/* Standing outside a Field there is no label to point at, so the
              trigger carries its own — the name half of the two the
              `aria-labelledby` above names, with the value as the other. */}
          {field?.labelId == null && (
            <span id={nameId} className="sr-only">
              {label}
            </span>
          )}
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-(--radius-xs) border border-(--rule-2)"
            // The colour as a flat GRADIENT, not as a colour. In the
            // `background` shorthand a plain colour is only legal in the last
            // layer, so `background: #a78bfa, <checks>` is invalid and the
            // whole declaration is dropped — which drew an empty swatch.
            style={{ background: `linear-gradient(${value}, ${value}), ${checkerboard('4px')}` }}
          />
          <span id={valueId} className="mono-meta truncate">
            {value}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent label={`${label} picker`} className="flex w-72 flex-col gap-3">
        <ToggleGroup
          type="single"
          value={format}
          // `type="single"` commits an empty string when the pressed segment is
          // the selected one, which here would leave the panel with no notation
          // to write in at all.
          onValueChange={(next) => next && commit(color, next as ColorFormat)}
          aria-label="Colour notation"
          className="w-full"
        >
          {(Object.keys(FORMAT_LABELS) as ColorFormat[]).map((option) => (
            <ToggleGroupItem key={option} value={option} className="flex-1">
              {FORMAT_LABELS[option]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* A group of two real sliders rather than a canvas with key handlers:
            the arrows, Home and End are then the platform's, and a reader is
            told which axis they are on and where they are along it. The canvas
            underneath is what a pointer aims at. */}
        <div
          ref={planeRef}
          role="group"
          aria-label={`${label} field`}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            trackPointer(event)
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) trackPointer(event)
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId)
            }
          }}
          // The focus ring has to be drawn HERE: the two sliders that take the
          // focus are `sr-only`, so the one the browser draws on them is
          // clipped away with the rest of the box.
          className="relative h-40 w-full cursor-crosshair touch-none select-none rounded-(--radius) focus-within:[outline:var(--focus-w)_solid_var(--focus)] focus-within:[outline-offset:var(--focus-off)]"
        >
          <canvas
            ref={(node) => {
              canvasRef.current = node
              // Closing destroys the canvas and its bitmap with it, so the next
              // open has to repaint even at the same hue.
              if (!node) painted.current = ''
              paint(node)
            }}
            width={PLANE_W}
            height={PLANE_H}
            aria-hidden="true"
            className="block size-full rounded-(--radius)"
          />
          {/* A hairline over the plane, so the light corner still has an edge. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-(--radius) shadow-[inset_0_0_0_1px_var(--rule)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -m-1.5 size-3 rounded-(--radius-pill) border-2 border-(--paper) shadow-[0_0_0_1px_var(--rule-hard)]"
            style={{ left: `${saturation * 100}%`, top: `${(1 - color.l) * 100}%`, background: opaque }}
          />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(saturation * 100)}
            aria-label="Chroma"
            aria-valuetext={`${Math.round(saturation * 100)} percent chroma`}
            onChange={(event) => setPlane(Number(event.target.value) / 100, color.l)}
            className="sr-only"
          />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(color.l * 100)}
            aria-label="Lightness"
            aria-valuetext={`${Math.round(color.l * 100)} percent lightness`}
            onChange={(event) => setPlane(saturation, Number(event.target.value) / 100)}
            className="sr-only"
          />
        </div>

        <ColorTrack
          name="Hue"
          max={360}
          step={1}
          value={color.h}
          announce={`${Math.round(color.h)} degrees`}
          thumb={opaque}
          track={`linear-gradient(to right in oklab, ${hueTrack})`}
          onChange={(h) => commit({ ...color, h, c: saturation * maxChroma(color.l, h, space) })}
        />
        <ColorTrack
          name="Opacity"
          max={100}
          step={1}
          value={color.a * 100}
          announce={`${Math.round(color.a * 100)} percent`}
          thumb={formatColor(color, 'oklch')}
          track={`linear-gradient(to right, transparent, ${opaque}), ${checkerboard('8px')}`}
          onChange={(percent) => commit({ ...color, a: percent / 100 })}
        />

        <Input
          value={value}
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} as CSS`}
          invalid={typed === null}
          onChange={(event) => {
            const next = event.target.value
            emitted.current = next
            if (controlled === undefined) setUncontrolled(next)
            const parsed = parseColor(next)
            if (parsed) {
              setColor(parsed)
              setFormat(colorFormat(next))
            }
            onValueChange?.(next)
          }}
          className="mono-meta"
        />
      </PopoverContent>
    </Popover>
  )
}

interface ColorTrackProps {
  name: string
  max: number
  step: number
  value: number
  /** What the number MEANS, since a bare "212" on a hue slider is not a reading. */
  announce: string
  /** CSS for the strip behind the thumb. */
  track: string
  /** The colour the thumb is filled with. */
  thumb: string
  onChange: (value: number) => void
}

/**
 * One channel of the picker, as a native range input.
 *
 * Native rather than this system's `Slider`, and deliberately: the whole point
 * of these two is the strip BEHIND the thumb — a hue ramp taken at the current
 * lightness, an opacity ramp over a checkerboard — and Radix's track is not a
 * surface a caller can paint. A native range gives the same keyboard contract
 * for nothing, which is what made the trade worth taking.
 */
function ColorTrack({ name, max, step, value, announce, track, thumb, onChange }: ColorTrackProps) {
  return (
    <label className="flex items-center gap-3 text-sm text-(--ink-2)">
      <span className="w-14 shrink-0">{name}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        aria-valuetext={announce}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ background: track }}
        className={cn(
          'h-4 w-full cursor-pointer appearance-none rounded-(--radius-xs) shadow-[inset_0_0_0_1px_var(--rule)]',
          '[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-(--radius-xs) [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-(--paper) [&::-webkit-slider-thumb]:bg-(--thumb) [&::-webkit-slider-thumb]:bg-clip-padding [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_var(--rule-hard)]',
          '[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-(--radius-xs) [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-(--paper) [&::-moz-range-thumb]:bg-(--thumb) [&::-moz-range-thumb]:bg-clip-padding [&::-moz-range-thumb]:shadow-[0_0_0_1px_var(--rule-hard)]',
        )}
        // Read by both thumb rules above; a pseudo-element cannot take a style
        // attribute of its own, so the colour has to arrive as a variable.
        ref={(node) => {
          node?.style.setProperty('--thumb', thumb)
        }}
      />
    </label>
  )
}

export default ColorPicker
