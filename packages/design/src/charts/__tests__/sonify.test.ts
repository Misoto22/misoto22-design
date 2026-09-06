import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SONIFY_DEFAULTS,
  createSonification,
  describeSeries,
  hasAudioSupport,
  sonifyDomain,
  sonifyDuration,
  sonifyTimeline,
  valueToFrequency,
  type SonifySeries,
  type SonifyStep,
} from '../lib/sonify'

const desktop: SonifySeries = {
  key: 'desktop',
  label: 'Desktop',
  values: [10, 20, 30],
  categories: ['Jan', 'Feb', 'Mar'],
}

const mobile: SonifySeries = {
  key: 'mobile',
  label: 'Mobile',
  values: [5, 15],
  categories: ['Jan', 'Feb'],
}

type Note = Extract<SonifyStep, { kind: 'note' }>
type Announce = Extract<SonifyStep, { kind: 'announce' }>

/** Only the notes, which is what the scheduling assertions are about. */
function notes(steps: SonifyStep[]): Note[] {
  return steps.filter((step): step is Note => step.kind === 'note')
}

function announcements(steps: SonifyStep[]): Announce[] {
  return steps.filter((step): step is Announce => step.kind === 'announce')
}

describe('value to pitch', () => {
  it('puts the bottom of the data at the root and the top a fixed span above it', () => {
    expect(valueToFrequency(10, { min: 10, max: 30 })).toBeCloseTo(220)
    // Two octaves up, which is what a 24-semitone span means.
    expect(valueToFrequency(30, { min: 10, max: 30 })).toBeCloseTo(880)
  })

  it('spaces equal data steps as equal INTERVALS, not as equal hertz', () => {
    const low = valueToFrequency(10, { min: 10, max: 30 })
    const middle = valueToFrequency(20, { min: 10, max: 30 })
    const high = valueToFrequency(30, { min: 10, max: 30 })

    // The whole argument for a semitone scale. The ear compares ratios, so two
    // equal steps in the data must sound like two equal steps in pitch — which
    // they do here (both are an octave) and would not on a linear hertz map,
    // where the second step would be twice the first.
    expect(middle / low).toBeCloseTo(high / middle)
    expect(high - middle).toBeGreaterThan(middle - low)
  })

  it('sounds a flat series in the middle of the range, not at the floor', () => {
    // Flat data is not low data. Mapping min === max onto the root would play a
    // run of bottom notes, which reads as "everything is at its worst".
    const flat = valueToFrequency(7, { min: 7, max: 7 })
    expect(flat).toBeCloseTo(220 * 2 ** 1)
  })

  it('clamps a value outside the domain rather than running off the scale', () => {
    expect(valueToFrequency(-100, { min: 0, max: 10 })).toBeCloseTo(220)
    expect(valueToFrequency(1_000, { min: 0, max: 10 })).toBeCloseTo(880)
  })

  it('honours a narrower span and a different root', () => {
    const pitch = { rootFrequency: 440, semitones: 12 }
    expect(valueToFrequency(0, { min: 0, max: 1 }, pitch)).toBeCloseTo(440)
    expect(valueToFrequency(1, { min: 0, max: 1 }, pitch)).toBeCloseTo(880)
  })
})

describe('the shared domain', () => {
  it('measures every series against one range, as the value axis does', () => {
    // Normalising each series to its own extremes would make a series that
    // never leaves 5–15 sound identical to one that swings 10–30, which is the
    // opposite of what the picture says.
    expect(sonifyDomain([desktop, mobile])).toEqual({ min: 5, max: 30 })
  })

  it('ignores gaps rather than reading them as zero', () => {
    expect(sonifyDomain([{ key: 'a', label: 'A', values: [null, 4, null, 8] }])).toEqual({
      min: 4,
      max: 8,
    })
  })

  it('reports no domain at all when nothing is finite', () => {
    expect(sonifyDomain([{ key: 'a', label: 'A', values: [null, null] }])).toBeNull()
  })
})

describe('the up-front announcement', () => {
  it('gives the listener a scale before the first tone', () => {
    // A run of tones with no frame of reference is unreadable: the listener
    // hears a contour and cannot tell whether it spans four units or four
    // million, nor how many points went by.
    const said = describeSeries(desktop)
    expect(said).toContain('Desktop')
    expect(said).toContain('3 points')
    expect(said).toContain('Jan to Mar')
    expect(said).toContain('from 10 to 30')
    // The direction of the mapping is a convention, not something the sound
    // carries, so it is stated once.
    expect(said).toContain('low pitch to high pitch')
  })

  it('says how many points are missing, so a short run is not a mystery', () => {
    expect(describeSeries({ key: 'a', label: 'A', values: [1, null, 3] })).toContain('1 missing')
  })

  it('says so plainly when there is nothing to play', () => {
    expect(describeSeries({ key: 'a', label: 'A', values: [null] })).toBe('A, no data.')
  })
})

describe('the timeline', () => {
  it('holds the first note back until the announcement has been read', () => {
    const steps = sonifyTimeline([desktop])
    expect(steps[0]).toMatchObject({ kind: 'announce', atMs: 0 })
    // A tone starting on top of a live region means the listener gets neither.
    expect(notes(steps)[0]?.atMs).toBe(SONIFY_DEFAULTS.leadInMs)
  })

  it('spaces the notes one slot apart', () => {
    const played = notes(sonifyTimeline([desktop]))
    expect(played.map((step) => step.atMs)).toEqual([1200, 1420, 1640])
  })

  it('leaves a gap sounding as a rest instead of closing it up', () => {
    const played = notes(sonifyTimeline([{ key: 'a', label: 'A', values: [10, null, 30] }]))

    // Closing the gap would move every later point earlier and quietly redraw
    // the shape the listener is being given.
    expect(played.map((step) => step.atMs)).toEqual([1200, 1420, 1640])
    expect(played[1]?.frequency).toBeNull()
    expect(played[1]?.point.value).toBeNull()
  })

  it('plays several series in sequence, each introduced by name', () => {
    const said = announcements(sonifyTimeline([desktop, mobile]))

    expect(said).toHaveLength(2)
    expect(said[1]?.text).toContain('Mobile')
    // Last note of the first series at 1640, plus its own slot, plus the gap.
    expect(said[1]?.atMs).toBe(1640 + SONIFY_DEFAULTS.noteMs + SONIFY_DEFAULTS.gapMs)
  })

  it('pitches both series against the shared domain', () => {
    const played = notes(sonifyTimeline([desktop, mobile]))
    const domain = { min: 5, max: 30 }

    expect(played[0]?.frequency).toBeCloseTo(valueToFrequency(10, domain))
    expect(played[3]?.frequency).toBeCloseTo(valueToFrequency(5, domain))
  })

  it('carries the category on every point, so a caller can mark it', () => {
    expect(notes(sonifyTimeline([desktop]))[1]?.point).toMatchObject({
      seriesKey: 'desktop',
      seriesLabel: 'Desktop',
      index: 1,
      category: 'Feb',
      value: 20,
    })
  })

  it('runs for the last note plus its own slot', () => {
    expect(sonifyDuration([desktop])).toBe(1640 + SONIFY_DEFAULTS.noteMs)
  })

  it('is empty for no series at all', () => {
    expect(sonifyTimeline([])).toEqual([])
    expect(sonifyDuration([])).toBe(0)
  })
})

/**
 * A stand-in for Web Audio.
 *
 * Deliberately not an assertion target for sound: there is no way to check what
 * something sounds like from a test, and pretending otherwise produces tests
 * that assert the implementation back at itself. What IS checkable is the rule
 * that matters for correctness — that no context exists until a user gesture
 * asks for one, and that unmounting releases it.
 */
let built = 0
let closed = 0
let resumed = 0

/**
 * Installs the stub on `window` as well as on `globalThis`.
 *
 * Under vitest's jsdom the two are not guaranteed to be the same object, and
 * the engine deliberately reads `window` — that is the check that keeps it
 * server-safe — so stubbing only the global would leave it looking unsupported.
 */
function stubAudioContext(value: unknown) {
  vi.stubGlobal('AudioContext', value)
  Object.defineProperty(window, 'AudioContext', { value, writable: true, configurable: true })
}

function param() {
  return {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  }
}

class AudioContextStub {
  currentTime = 0
  state: AudioContextState = 'suspended'
  destination = {}

  constructor() {
    built += 1
  }

  createGain() {
    return { gain: param(), connect: vi.fn(), disconnect: vi.fn() }
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: param(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    }
  }

  resume() {
    resumed += 1
    this.state = 'running'
    return Promise.resolve()
  }

  close() {
    closed += 1
    return Promise.resolve()
  }
}

describe('the audio context', () => {
  beforeEach(() => {
    built = 0
    closed = 0
    resumed = 0
    vi.useFakeTimers()
    stubAudioContext(AudioContextStub)
  })

  afterEach(() => {
    vi.useRealTimers()
    stubAudioContext(undefined)
    vi.unstubAllGlobals()
  })

  it('is not built when the run is created', () => {
    // Charts build their controller during render. A context created there
    // would break a server render and would burn one of the browser's limited
    // context slots on a chart nobody listens to.
    createSonification({ series: [desktop] })
    expect(built).toBe(0)
  })

  it('is built on the first play and never again', () => {
    const run = createSonification({ series: [desktop] })

    run.play()
    expect(built).toBe(1)

    run.pause()
    run.play()
    expect(built).toBe(1)
  })

  it('is resumed, because a context can arrive suspended even inside a gesture', () => {
    createSonification({ series: [desktop] }).play()
    expect(resumed).toBe(1)
  })

  it('is closed by destroy, so an unmounted chart releases the hardware', () => {
    const run = createSonification({ series: [desktop] })
    run.play()
    run.destroy()
    expect(closed).toBe(1)
  })

  it('reports no support where the constructor is missing', () => {
    stubAudioContext(undefined)
    expect(hasAudioSupport()).toBe(false)
  })
})

describe('playing a run', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubAudioContext(AudioContextStub)
  })

  afterEach(() => {
    vi.useRealTimers()
    stubAudioContext(undefined)
    vi.unstubAllGlobals()
  })

  it('announces first and sounds the first point after the lead-in', () => {
    const onAnnounce = vi.fn()
    const onPoint = vi.fn()
    const run = createSonification({ series: [desktop], onAnnounce, onPoint })

    run.play()
    vi.advanceTimersByTime(0)
    expect(onAnnounce).toHaveBeenCalledTimes(1)
    expect(onPoint).toHaveBeenLastCalledWith(null)

    vi.advanceTimersByTime(SONIFY_DEFAULTS.leadInMs)
    expect(onPoint).toHaveBeenLastCalledWith(expect.objectContaining({ index: 0, value: 10 }))
  })

  it('reports the state a control has to label itself from', () => {
    const onStateChange = vi.fn()
    const run = createSonification({ series: [desktop], onStateChange })

    run.play()
    expect(run.state).toBe('playing')
    run.pause()
    expect(run.state).toBe('paused')
    run.stop()
    expect(run.state).toBe('idle')
    expect(onStateChange.mock.calls.flat()).toEqual(['playing', 'paused', 'idle'])
  })

  it('holds position on pause and carries on from there', () => {
    const onPoint = vi.fn()
    const run = createSonification({ series: [desktop], onPoint })

    run.play()
    vi.advanceTimersByTime(SONIFY_DEFAULTS.leadInMs)
    run.pause()

    const afterPause = onPoint.mock.calls.length
    vi.advanceTimersByTime(10_000)
    expect(onPoint).toHaveBeenCalledTimes(afterPause)

    run.play()
    vi.advanceTimersByTime(SONIFY_DEFAULTS.noteMs)
    expect(onPoint).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1 }))
  })

  it('rewinds on stop, so the next play starts at the beginning', () => {
    const onAnnounce = vi.fn()
    const run = createSonification({ series: [desktop], onAnnounce })

    run.play()
    vi.advanceTimersByTime(SONIFY_DEFAULTS.leadInMs)
    run.stop()

    run.play()
    vi.advanceTimersByTime(0)
    expect(onAnnounce).toHaveBeenCalledTimes(2)
  })

  it('ends by clearing the marked point and saying so once', () => {
    const onEnd = vi.fn()
    const onPoint = vi.fn()
    const run = createSonification({ series: [desktop], onEnd, onPoint })

    run.play()
    vi.advanceTimersByTime(run.durationMs + 1)

    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onPoint).toHaveBeenLastCalledWith(null)
    expect(run.state).toBe('idle')
  })

  it('cancels every pending timer on destroy', () => {
    const onPoint = vi.fn()
    const run = createSonification({ series: [desktop], onPoint })

    run.play()
    run.destroy()

    // An unmounted chart that keeps firing callbacks sets state on a component
    // that is gone, which is the classic way this kind of feature leaks.
    vi.advanceTimersByTime(60_000)
    expect(onPoint).not.toHaveBeenCalled()
  })
})
