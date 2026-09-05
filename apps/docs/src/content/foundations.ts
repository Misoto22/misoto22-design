/**
 * The foundations pages.
 *
 * Each one renders a slice of the generated token data — the values themselves
 * are never written here, only which categories a page shows and the prose that
 * explains why they are what they are.
 */

export interface FoundationPage {
  slug: string
  title: string
  summary: string
  /** Categories from the token extractor, in the order the page shows them. */
  categories: { key: string; title: string; note?: string }[]
  /** Paragraphs under the title. */
  intro: string[]
}

export const FOUNDATIONS: FoundationPage[] = [
  {
    slug: 'colour',
    title: 'Colour',
    summary: 'A white ground, a near-black mark, three rule weights, and status.',
    intro: [
      'The system is monochrome. The ground is paper-white, the mark is near-black, and the only chroma left in the file is status — which is bound to state and never to brand. What used to be carried by hue is carried by weight, by rule, and by reversal.',
      'There are two text steps and nothing lighter. The floor is --ink-3-aa, which clears WCAG AA on white at 6.7:1; every step above it is darker. A tint that would sit below that line is not a colour choice available to this system.',
      'Dark mode is a value swap on the same names, not a second palette. That is why a component never reads a primitive directly: it reads a semantic alias, and the alias re-resolves on its own when the mode attribute flips.',
    ],
    categories: [
      { key: 'colour', title: 'Colour tokens' },
      {
        key: 'depth',
        title: 'Depth',
        note: 'Three of these resolve to nothing on purpose. A box-shadow in this system is never blurred; --lift is the hard ink offset that replaces the elevation ramp.',
      },
      { key: 'focus', title: 'Focus' },
    ],
  },
  {
    slug: 'typography',
    title: 'Typography',
    summary: 'Three faces, one heading ladder, and nothing above the page title.',
    intro: [
      'Hanken Grotesk for interface, Newsreader for headings and editorial voice, IBM Plex Mono for labels and data. Each stack names a CJK fallback, so a Chinese page renders in a matched face rather than in whatever the platform substitutes.',
      'The heading scale is a single ladder every surface climbs, fluid between a phone and the 1288px page. Nothing sits above --fs-title: a page has exactly one thing larger than its own records. Steps sit close together deliberately — the ladder separates records of the same kind, not a heading from its own sub-heading, so two headings that nest must skip a step.',
    ],
    categories: [{ key: 'type', title: 'Type tokens' }],
  },
  {
    slug: 'space',
    title: 'Space & shape',
    summary: 'The page gutter, the measures, and the four radii.',
    intro: [
      'Measures are capped in ch rather than px, so they track the type they are set in. --measure-record is a ceiling on a listed record’s description, not a width: a narrower column still wins.',
      'There are four radius steps and there is no fifth. A 50% circle is geometry rather than a corner and is not a step here.',
    ],
    categories: [
      { key: 'space', title: 'Layout' },
      { key: 'radius', title: 'Radius' },
      { key: 'icon', title: 'Icons' },
      { key: 'layer', title: 'Stacking order' },
    ],
  },
  {
    slug: 'motion',
    title: 'Motion',
    summary: 'One curve, three durations, and a reduced-motion rule that is not optional.',
    intro: [
      'One easing curve for the whole system. Three durations: --fast for a state flip, --mid for a panel, --slow for something the size of a page. A component that needs a fourth is usually doing two things.',
      'Every animation in the package is gated behind motion-safe, and the keyframe layer carries one reduced-motion rule that stops anything marked data-m22-animated. A reader who asked for less motion gets the end state, not a faster version of the same move.',
    ],
    categories: [{ key: 'motion', title: 'Motion tokens' }],
  },
]

export const FOUNDATION_BY_SLUG = new Map(FOUNDATIONS.map((page) => [page.slug, page]))
