import { defaultTick } from './format'

/**
 * A chart's values as pitch over time — the reading a listener gets instead of
 * the picture.
 *
 * The hidden data table (see `figure.tsx`) hands a screen-reader user every
 * number, which is access but not a SHAPE: fourteen figures read one at a time
 * do not tell anyone that the line dips in March and never recovers. A run of
 * tones does, in three seconds, and it is the one thing a chart can offer that
 * a table cannot. Highcharts is the only mainstream library that ships it; this
 * is that idea, without the dependency.
 *
 * Nothing here touches `window` or constructs an `AudioContext` at module load.
 * The context is created on the first `play()`, which is the only moment a
 * browser will allow it — every engine blocks audio until a user gesture, and a
 * context built at import time arrives permanently `suspended`.
 *
 * **This never starts on its own.** `prefers-reduced-motion` is not the setting
 * that governs it — sound is not motion, and gating audio behind a motion
 * preference would both silence readers who want it and imply that readers who
 * do not want motion also do not want sound. The correct rule is simpler and
 * absolute: audio begins from an explicit user action, and from nothing else.
 * There is deliberately no `autoPlay` option to pass.
 */

/** Whether the run is sounding, held, or not started. */
export type SonifyState = 'idle' | 'playing' | 'paused'

/**
 * The oscillator behind every note.
 *
 * `triangle` is the default because the two obvious choices are both worse: a
 * `sine` has no harmonics above its fundamental, so on a laptop speaker — which
 * reproduces almost nothing under 200 Hz — the bottom of the range simply
 * vanishes, and a listener hears silence where the data is lowest. A `square`
 * is the opposite problem: all odd harmonics at full strength is fatiguing
 * inside ten notes and genuinely unpleasant across sixty. A triangle carries
 * enough harmonic content to survive a small speaker and stay comfortable.
 */
export type SonifyWave = 'sine' | 'triangle' | 'square' | 'sawtooth'

/** The value range the pitch scale is stretched across. */
export interface SonifyDomain {
  min: number
  max: number
}

/** One series, flattened to what sound needs: its values, in order. */
export interface SonifySeries {
  /** The series key, so a caller can tie a point back to its own data. */
  key: string
  /** What the series is called, spoken before its run of tones. */
  label: string
  /** One entry per point. `null` is a gap — it holds its slot in silence. */
  values: (number | null)[]
  /** The category axis, if there is one. Used to say where the run starts and ends. */
  categories?: string[]
}

/** The point sounding right now, for a caller that wants to highlight it. */
export interface SonifyPoint {
  seriesKey: string
  seriesLabel: string
  /** Position within its own series. */
  index: number
  /** The category this point sits at, when the chart has a category axis. */
  category?: string
  /** `null` for a gap in the data, which sounds as a rest. */
  value: number | null
}

export interface SonifyOptions {
  /** How long each point holds the floor. Below ~90ms the run stops being readable. */
  noteMs?: number
  /** Silence after a series, before the next one is announced. */
  gapMs?: number
  /**
   * The pause between an announcement and the first note it describes.
   *
   * Not decoration: a screen reader needs the floor to itself to read the range
   * out, and a tone starting on top of it means the listener gets neither.
   */
  leadInMs?: number
  /** The pitch the lowest value sounds at, in Hz. */
  rootFrequency?: number
  /** How far above the root the highest value sits, in semitones. */
  semitones?: number
  wave?: SonifyWave
  /** Peak gain per note, 0–1. Deliberately quiet; a chart is not a media player. */
  volume?: number
  /**
   * How a number is spoken in an announcement. Defaults to the axis's own
   * formatting.
   *
   * Define it outside the render or memoise it. It is part of what the run
   * says, so a new function identity rebuilds the run — and a rebuilt run is a
   * stopped one.
   */
  formatValue?: (value: number) => string
}

/**
 * The defaults, and why each is the number it is.
 *
 * `rootFrequency` 220 Hz (A3) with a `semitones` span of 24 puts the whole
 * range between A3 and A5. Below roughly 200 Hz a laptop or phone speaker
 * reproduces very little, and above about 1 kHz sustained tones start to read
 * as an alarm; two octaves inside that window is the widest span that stays
 * comfortable at both ends. Two octaves is also about where pitch DISCRIMINATION
 * stops improving — stretching to four does not let anyone read the numbers off
 * more precisely, it just makes the top shrill.
 */
export const SONIFY_DEFAULTS = {
  noteMs: 220,
  gapMs: 700,
  leadInMs: 1200,
  rootFrequency: 220,
  semitones: 24,
  wave: 'triangle',
  volume: 0.18,
} as const satisfies Required<Omit<SonifyOptions, 'formatValue'>>

/** Ramp up, in seconds. Short enough to read as an attack, long enough not to click. */
const ATTACK_SECONDS = 0.008

/** Ramp down, in seconds. Longer than the attack, as a plucked note is. */
const RELEASE_SECONDS = 0.06

/** How much of its slot a note actually sounds for; the rest is the gap between notes. */
const NOTE_DUTY = 0.85

/**
 * How far ahead of the clock a note is scheduled.
 *
 * Scheduling at `currentTime` exactly means scheduling in the past by the time
 * the call returns on a busy main thread, and Web Audio silently drops those.
 * Twenty milliseconds is inaudible as latency and is more than the jitter a
 * timer introduces.
 */
const LOOKAHEAD_SECONDS = 0.02

/** The fade applied when a note is cut short by a pause or a stop. */
const CUT_SECONDS = 0.015

/**
 * A value's pitch, on a semitone scale rather than a linear sweep of hertz.
 *
 * This is the single most important decision in the file. Pitch perception is
 * logarithmic: the ear hears a RATIO, not a difference. 220 Hz to 440 Hz is one
 * octave and so is 440 Hz to 880 Hz, even though the second gap is twice as
 * many hertz. Map values linearly onto hertz and the consequence is immediate —
 * the bottom half of the data spreads across most of the perceived range while
 * the top half compresses into a few near-identical tones, so a rise from 900
 * to 1000 sounds like nothing and a rise from 10 to 110 sounds enormous. The
 * chart lied.
 *
 * Mapping the value range onto a fixed span of SEMITONES fixes it: equal steps
 * in the data become equal musical intervals, which is what a listener actually
 * compares. The map is linear-in-value and exponential-in-frequency, so it is
 * the audio equivalent of a linear axis — not a log axis, which would be a
 * different claim about the data.
 *
 * A flat series (`min === max`) sounds at the middle of the range rather than at
 * the floor: flat data is not low data, and a run of bottom notes reads as one.
 *
 * @example
 * valueToFrequency(50, { min: 0, max: 100 }) // 220 * 2 ** 1 = 440 Hz, one octave up
 */
export function valueToFrequency(
  value: number,
  domain: SonifyDomain,
  pitch: Pick<SonifyOptions, 'rootFrequency' | 'semitones'> = {},
): number {
  const root = pitch.rootFrequency ?? SONIFY_DEFAULTS.rootFrequency
  const semitones = pitch.semitones ?? SONIFY_DEFAULTS.semitones
  const span = domain.max - domain.min

  const position = span === 0 ? 0.5 : (value - domain.min) / span
  const clamped = Math.min(1, Math.max(0, position))

  return root * 2 ** ((clamped * semitones) / 12)
}

/**
 * The value range every series is measured against, or `null` when nothing is
 * finite.
 *
 * Shared across all series on purpose. These charts draw their series against
 * ONE value axis, so they have to sound against one pitch axis too — normalising
 * each series to its own extremes would make a flat series that never leaves 2%
 * sound exactly like the one that swings across the whole plot, which is the
 * opposite of what the picture says.
 */
export function sonifyDomain(series: SonifySeries[]): SonifyDomain | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const entry of series) {
    for (const value of entry.values) {
      if (value === null || !Number.isFinite(value)) continue
      if (value < min) min = value
      if (value > max) max = value
    }
  }

  return min === Number.POSITIVE_INFINITY ? null : { min, max }
}

/**
 * What is said before a series plays.
 *
 * A run of tones with no frame of reference is unreadable — the listener hears
 * a contour and has no idea whether it spans four units or four million, or how
 * many points went by. Naming the count, the span of the category axis and the
 * two extremes costs one sentence and turns the melody into a measurement. The
 * direction of the mapping is stated too, because "higher is more" is a
 * convention, not a fact the sound carries.
 */
export function describeSeries(
  series: SonifySeries,
  formatValue: (value: number) => string = defaultTick,
): string {
  const finite = series.values.filter((value): value is number => value !== null && Number.isFinite(value))

  if (finite.length === 0) return `${series.label}, no data.`

  const categories = series.categories ?? []
  const first = categories[0]
  const last = categories[categories.length - 1]
  const span = first !== undefined && last !== undefined && first !== last ? `, ${first} to ${last}` : ''

  const low = formatValue(Math.min(...finite))
  const high = formatValue(Math.max(...finite))
  const gaps = series.values.length - finite.length
  const missing = gaps > 0 ? ` ${gaps} missing.` : ''

  return `${series.label}, ${series.values.length} points${span}. Values from ${low} to ${high}, low pitch to high pitch.${missing}`
}

/** One thing that happens at one moment: something said, or a note sounded. */
export type SonifyStep =
  | { kind: 'announce'; atMs: number; text: string }
  | { kind: 'note'; atMs: number; point: SonifyPoint; frequency: number | null }

/**
 * The whole run, laid out on a timeline before a single sound is made.
 *
 * Built as data rather than driven by a loop with a timer inside it, because
 * this is the part worth testing: the maths that decides when each note lands
 * is checkable without a speaker, and pause/resume becomes "walk the same array
 * from a different index" rather than a second, subtly different code path.
 *
 * Several series play **in sequence, each introduced by name**, rather than
 * simultaneously with one panned to each ear. Hard panning is the more
 * impressive demo and the wrong choice: it assumes a stereo output and two
 * usable ears, so a mono speaker, a single hearing aid, or unilateral hearing
 * loss collapses both series into one interleaved melody the listener cannot
 * unpick — and it caps the feature at two series, when four is ordinary. Played
 * in sequence, the worst case is that the run takes longer, which is a cost the
 * listener can see coming and a caller can shorten with `noteMs`.
 */
export function sonifyTimeline(series: SonifySeries[], options: SonifyOptions = {}): SonifyStep[] {
  const noteMs = options.noteMs ?? SONIFY_DEFAULTS.noteMs
  const gapMs = options.gapMs ?? SONIFY_DEFAULTS.gapMs
  const leadInMs = options.leadInMs ?? SONIFY_DEFAULTS.leadInMs
  const formatValue = options.formatValue ?? defaultTick

  const domain = sonifyDomain(series)
  const steps: SonifyStep[] = []
  let at = 0

  series.forEach((entry, entryIndex) => {
    if (entryIndex > 0) at += gapMs
    steps.push({ kind: 'announce', atMs: at, text: describeSeries(entry, formatValue) })
    at += leadInMs

    entry.values.forEach((raw, index) => {
      const value = raw !== null && Number.isFinite(raw) ? raw : null
      steps.push({
        kind: 'note',
        atMs: at,
        point: {
          seriesKey: entry.key,
          seriesLabel: entry.label,
          index,
          category: entry.categories?.[index],
          value,
        },
        // A gap keeps its slot and sounds as a rest. Closing it up would move
        // every later point earlier and quietly redraw the shape.
        frequency: value === null || domain === null ? null : valueToFrequency(value, domain, options),
      })
      at += noteMs
    })
  })

  return steps
}

/** How long the whole run takes, in milliseconds. */
export function sonifyDuration(series: SonifySeries[], options: SonifyOptions = {}): number {
  const steps = sonifyTimeline(series, options)
  const last = steps[steps.length - 1]
  if (!last) return 0
  return last.kind === 'note' ? last.atMs + (options.noteMs ?? SONIFY_DEFAULTS.noteMs) : last.atMs
}

/**
 * Whether this environment can make a sound at all.
 *
 * Safe on a server: it reads `window` from inside a function, so importing this
 * module during a server render touches nothing.
 */
export function hasAudioSupport(): boolean {
  if (typeof window === 'undefined') return false
  return audioContextConstructor() !== undefined
}

type AudioContextConstructor = new () => AudioContext

function audioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  const scope = window as typeof window & { webkitAudioContext?: AudioContextConstructor }
  return scope.AudioContext ?? scope.webkitAudioContext
}

export interface SonifyHandlers {
  /** The point currently sounding, so a chart can mark it. `null` between series. */
  onPoint?: (point: SonifyPoint | null) => void
  /** Text meant for a live region — the range announcement before each series. */
  onAnnounce?: (text: string) => void
  onStateChange?: (state: SonifyState) => void
  /** Fires once the last note has sounded, not when it was scheduled. */
  onEnd?: () => void
}

export interface SonifyInput extends SonifyHandlers {
  series: SonifySeries[]
  options?: SonifyOptions
}

export interface SonifyController {
  /**
   * Starts, or resumes from where a pause left off.
   *
   * MUST be called from a user gesture. That is a browser rule, not a
   * preference — and it is also the accessibility rule this feature is built
   * on, so there is no way to reach this except from something the reader did.
   */
  play: () => void
  /** Holds position. The current note is faded out rather than cut. */
  pause: () => void
  /** Stops and rewinds to the beginning. */
  stop: () => void
  /** Stops and releases the audio hardware. Call on unmount. */
  destroy: () => void
  readonly state: SonifyState
  /** The whole run, in milliseconds. */
  readonly durationMs: number
}

/**
 * A run of one chart's series, ready to play.
 *
 * Constructing one allocates nothing but an array — no `AudioContext`, no
 * timer, no node. That matters because a chart builds its controller during
 * render, where creating a context would both break a server render and burn
 * one of the browser's limited context slots on a chart nobody listens to.
 *
 * @example
 * const run = createSonification({
 *   series: [{ key: 'desktop', label: 'Desktop', values: [186, 305, 237], categories: ['Jan', 'Feb', 'Mar'] }],
 *   onPoint: (point) => setActive(point),
 * })
 * button.addEventListener('click', () => run.play())
 */
export function createSonification({
  series,
  options = {},
  onPoint,
  onAnnounce,
  onStateChange,
  onEnd,
}: SonifyInput): SonifyController {
  const steps = sonifyTimeline(series, options)
  const durationMs = sonifyDuration(series, options)
  const wave = options.wave ?? SONIFY_DEFAULTS.wave
  const volume = options.volume ?? SONIFY_DEFAULTS.volume
  const noteMs = options.noteMs ?? SONIFY_DEFAULTS.noteMs

  let state: SonifyState = 'idle'
  let cursor = 0
  let elapsedMs = 0
  let anchorMs = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let context: AudioContext | null = null
  let master: GainNode | null = null
  const live = new Set<{ oscillator: OscillatorNode; gain: GainNode }>()

  function setState(next: SonifyState) {
    if (state === next) return
    state = next
    onStateChange?.(next)
  }

  /**
   * The context, built on demand.
   *
   * Returns `null` where audio is unavailable rather than throwing, so a
   * browser without Web Audio degrades to a control that does nothing visible
   * instead of an unhandled error inside a click handler.
   */
  function audio(): { context: AudioContext; master: GainNode } | null {
    if (context && master) return { context, master }

    const Constructor = audioContextConstructor()
    if (!Constructor) return null

    context = new Constructor()
    master = context.createGain()
    master.gain.value = volume
    master.connect(context.destination)
    return { context, master }
  }

  /**
   * One note, with an envelope.
   *
   * The envelope is not polish. An oscillator switched on at full amplitude
   * starts mid-waveform, and that step discontinuity is broadband — it is heard
   * as a click on every single note, which across sixty points is louder and
   * more tiring than the data itself. A few milliseconds of ramp at each end
   * removes it completely.
   */
  function sound(frequency: number, at: number) {
    const engine = audio()
    if (!engine) return

    const body = Math.max(ATTACK_SECONDS + RELEASE_SECONDS, (noteMs / 1000) * NOTE_DUTY)
    const oscillator = engine.context.createOscillator()
    const gain = engine.context.createGain()

    oscillator.type = wave
    oscillator.frequency.setValueAtTime(frequency, at)

    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(1, at + ATTACK_SECONDS)
    gain.gain.setValueAtTime(1, at + body - RELEASE_SECONDS)
    gain.gain.linearRampToValueAtTime(0, at + body)

    oscillator.connect(gain)
    gain.connect(engine.master)
    oscillator.start(at)
    oscillator.stop(at + body)

    const node = { oscillator, gain }
    live.add(node)
    oscillator.onended = () => {
      live.delete(node)
      gain.disconnect()
      oscillator.disconnect()
    }
  }

  /** Fades whatever is sounding, rather than cutting it — a cut clicks too. */
  function silence() {
    if (!context) return
    const now = context.currentTime
    for (const node of live) {
      node.gain.gain.cancelScheduledValues(now)
      node.gain.gain.setValueAtTime(node.gain.gain.value, now)
      node.gain.gain.linearRampToValueAtTime(0, now + CUT_SECONDS)
      node.oscillator.stop(now + CUT_SECONDS)
    }
  }

  function clearTimer() {
    if (timer === null) return
    clearTimeout(timer)
    timer = null
  }

  function finish() {
    clearTimer()
    cursor = 0
    elapsedMs = 0
    setState('idle')
    onPoint?.(null)
    onEnd?.()
  }

  function tick() {
    timer = null
    const step = steps[cursor]
    if (!step) {
      finish()
      return
    }

    cursor += 1

    if (step.kind === 'announce') {
      onPoint?.(null)
      onAnnounce?.(step.text)
    } else {
      onPoint?.(step.point)
      if (step.frequency !== null && context) {
        sound(step.frequency, context.currentTime + LOOKAHEAD_SECONDS)
      }
    }

    schedule()
  }

  /** Queues the next step against the run's own clock, so jitter never accumulates. */
  function schedule() {
    const next = steps[cursor]
    const target = next ? next.atMs : durationMs
    const wait = Math.max(0, target - (Date.now() - anchorMs))
    timer = setTimeout(tick, wait)
  }

  function play() {
    if (state === 'playing') return

    const engine = audio()
    // A context created inside a gesture handler can still arrive suspended —
    // Safari does this — so it is resumed rather than assumed live.
    if (engine && engine.context.state === 'suspended') void engine.context.resume()

    anchorMs = Date.now() - elapsedMs
    setState('playing')
    schedule()
  }

  function pause() {
    if (state !== 'playing') return
    elapsedMs = Date.now() - anchorMs
    clearTimer()
    silence()
    setState('paused')
  }

  function stop() {
    clearTimer()
    silence()
    cursor = 0
    elapsedMs = 0
    setState('idle')
    onPoint?.(null)
  }

  function destroy() {
    clearTimer()
    silence()
    cursor = 0
    elapsedMs = 0
    state = 'idle'
    void context?.close()
    context = null
    master = null
    live.clear()
  }

  return {
    play,
    pause,
    stop,
    destroy,
    get state() {
      return state
    },
    get durationMs() {
      return durationMs
    },
  }
}
