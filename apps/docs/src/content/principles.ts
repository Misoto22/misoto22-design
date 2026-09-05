/**
 * The eight laws, in one place.
 *
 * They live here rather than inside the page that prints them because they are
 * also published as text for agents, and a second copy of a law is a second law.
 */
/**
 * The primitives the laws were written against — the first scaffold, before
 * the library grew.
 *
 * The demonstrations on the principles page are built only from these. A law
 * illustrated with a component that was added later to satisfy it proves
 * nothing: the argument is that these rules were derivable from the original
 * set, and the page should be able to show that with the original set.
 *
 * `principles.test.ts` fails if a name here is no longer in the registry.
 */
export const ORIGINAL_SET = [
  'AppShell', 'Badge', 'Button', 'Card', 'Checkbox', 'Dialog', 'DropdownMenu',
  'EmptyState', 'ErrorState', 'Field', 'Input', 'NavItem', 'Select', 'Spinner',
  'StatusDot', 'StatusPill', 'Switch', 'Tabs', 'Tag', 'Textarea', 'Toast',
] as const

export interface Law {
  /** Two digits, because the page numbers them and a law is cited by number. */
  n: string
  title: string
  body: string
  /** The thing the law forbids, stated concretely enough to check against. */
  rules_out: string
}

export const LAWS: Law[] = [
  {
    n: '01',
    title: 'The ground is paper.',
    body: 'White, not off-white, and the same white on every surface. There is no card colour, no elevated panel tint, and no "subtle background" that quietly becomes a second ground.',
    rules_out: 'A card that separates itself from the page by being a different shade of white.',
  },
  {
    n: '02',
    title: 'A shadow is never blurred.',
    body: 'The system has no light source, so it has no elevation ramp. Depth is a hairline, a change of ground, or a hard ink offset with no blur radius.',
    rules_out: 'box-shadow: 0 2px 8px rgba(0,0,0,.08) — and the whole scale it belongs to.',
  },
  {
    n: '03',
    title: 'The rule does the work colour would.',
    body: 'Three weights, and each is chosen by what it separates: hairline between rows, edge between blocks, hard under a masthead. A monochrome page has nothing else to divide with.',
    rules_out: 'Five hand-tuned greys, picked per component, that nobody can tell apart.',
  },
  {
    n: '04',
    title: 'There are two text steps and nothing lighter.',
    body: 'The floor clears AA on white at 6.7:1. Every step above it is darker. A third, lighter grey is not a design decision available here.',
    rules_out: '#999 on white, for "secondary" text that half the readers cannot see.',
  },
  {
    n: '05',
    title: 'Chroma is bound to state.',
    body: 'Green, amber and red mean succeeded, needs attention, and failed. They are never decorative, and the meaning is always doubled — by an icon, by the words, or by both.',
    rules_out: 'A blue badge because the row needed some colour.',
  },
  {
    n: '06',
    title: 'One ladder, and the page owns the top of it.',
    body: 'Five heading steps, fluid between a phone and the full page, and nothing sits above the page title. Two headings that nest must skip a step, or the hierarchy is not readable as one.',
    rules_out: 'A card title on one page that is larger than another page’s own h1.',
  },
  {
    n: '07',
    title: 'The accent is ink.',
    body: 'In a monochrome system the single editorial pointer collapses onto the mark. What used to be carried by hue is carried by weight, by an underline, by a filled pill, or by reversal.',
    rules_out: 'A brand hue reintroduced through a link colour or a hover state.',
  },
  {
    n: '08',
    title: 'Dark mode is a value swap, not a second palette.',
    body: 'The same token names, different values. That is why a component reads a semantic alias and never a primitive: the alias re-resolves on its own when the mode flips. The two exceptions — type over a photograph, and a foreign brand mark — are documented where they are defined, because their ground is not the theme.',
    rules_out: 'A .dark block in a component’s own stylesheet, freezing one side of the swap.',
  },
]
