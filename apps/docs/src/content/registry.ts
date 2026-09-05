/**
 * What the site says about each component, and where it sits in the sidebar.
 *
 * Deliberately hand-written, and deliberately SMALL. Everything mechanical —
 * the prop table, the defaults, the JSDoc, the example code — is read out of
 * the package's own source at build time (see `scripts/generate.mjs`). What is
 * left here is the part a parser cannot produce: which group a component
 * belongs to, the one-line summary, when to reach for it instead of its
 * neighbour, and the accessibility promises it makes.
 *
 * `dir` is the key into the generated data, so it must match the directory name
 * under `packages/design/src/components`. A mismatch is caught by
 * `registry.test.ts` rather than by a blank page.
 */

export const GROUPS = [
  'Actions',
  'Display',
  'Feedback',
  'Forms',
  'Overlays',
  'Navigation',
  'Surfaces',
] as const

export type ComponentGroup = (typeof GROUPS)[number]

export interface ComponentEntry {
  /** URL segment. */
  slug: string
  /** Directory under packages/design/src/components — the generated-data key. */
  dir: string
  /** Display name. */
  name: string
  group: ComponentGroup
  /** One line, shown in the index and under the page title. */
  summary: string
  /** When to reach for this rather than the component beside it. */
  when?: string
  /** Promises the component keeps so a call site does not have to. */
  accessibility?: string[]
  /** Slugs of components a reader is likely to want next. */
  related?: string[]
}

export const COMPONENTS: ComponentEntry[] = [
  // ─── Actions ───
  {
    slug: 'button',
    dir: 'Button',
    name: 'Button',
    group: 'Actions',
    summary: 'The system’s action, as a pill that does not move on hover.',
    when: 'Anything that DOES something. If it navigates and looks like text, it is a link, not a ghost button.',
    accessibility: [
      'A native <button> by default, so Enter and Space both fire it.',
      'loading sets aria-busy and disables the control; the label stays, so the box does not collapse under the pointer that just clicked it.',
      'A link cannot be disabled, so href + loading sets aria-disabled and blocks pointer events instead.',
      'iconOnly has no text, so it requires aria-label — the single most common way a design system ships an unusable control.',
    ],
    related: ['floating-icon-button', 'spinner'],
  },
  {
    slug: 'floating-icon-button',
    dir: 'FloatingIconButton',
    name: 'FloatingIconButton',
    group: 'Actions',
    summary: 'A round action pinned to a screen corner.',
    when: 'A page-level affordance that must stay reachable while the reader scrolls — back to top, a mobile table of contents.',
    accessibility: [
      'label is the only name the control has; it is required rather than optional.',
      '44px square, which is the pointer-target floor (WCAG 2.5.8).',
    ],
    related: ['button'],
  },

  // ─── Display ───
  {
    slug: 'badge',
    dir: 'Badge',
    name: 'Badge',
    group: 'Display',
    summary: 'A count or a state, set in mono so it reads as metadata.',
    when: 'One fact about one record. If it names what something is ABOUT, that is a Tag.',
    accessibility: [
      'Not interactive. A badge with an onClick is a control a keyboard cannot reach.',
      'The status tones double their colour with words, so the meaning survives monochrome and colour-blindness.',
    ],
    related: ['tag', 'status-pill'],
  },
  {
    slug: 'tag',
    dir: 'Tag',
    name: 'Tag',
    group: 'Display',
    summary: 'A subject label — a topic, a technology, a filter facet.',
    when: 'Several sit together and the reader scans them. One fact about one record is a Badge.',
    accessibility: [
      'Presentational. To filter with it, wrap it in a button and pass active, so the focus ring and the pressed state stay with the element that owns them.',
    ],
    related: ['badge'],
  },
  {
    slug: 'kbd',
    dir: 'Kbd',
    name: 'Kbd',
    group: 'Display',
    summary: 'A key on a keyboard, set as one.',
    accessibility: ['Renders <kbd>, which carries the meaning a styled <span> does not.'],
    related: ['badge'],
  },
  {
    slug: 'avatar',
    dir: 'Avatar',
    name: 'Avatar',
    group: 'Display',
    summary: 'A person, as a circle, with initials until the image lands.',
    accessibility: [
      'alt describes the person, not the picture. An empty string is correct when the name is already printed beside it.',
      'The initials are aria-hidden — read aloud they are noise.',
    ],
  },
  {
    slug: 'status-dot',
    dir: 'StatusDot',
    name: 'StatusDot',
    group: 'Display',
    summary: 'The dot beside a status word.',
    accessibility: [
      'aria-hidden without exception: it repeats a state the adjacent label already names.',
      'The halo is motion-safe, so a reader who asked for less motion gets a still dot.',
    ],
    related: ['status-pill'],
  },
  {
    slug: 'status-pill',
    dir: 'StatusPill',
    name: 'StatusPill',
    group: 'Display',
    summary: 'A live state, named: a dot plus an uppercase mono label.',
    related: ['status-dot', 'badge'],
  },
  {
    slug: 'link-arrow',
    dir: 'LinkArrow',
    name: 'LinkArrow',
    group: 'Display',
    summary: 'The mark on a link that leaves the page.',
    accessibility: [
      'aria-hidden, so it is not read as “north east arrow” in the middle of a sentence.',
      'Sized in em, so it tracks whatever type it sits beside instead of competing with it.',
    ],
  },
  {
    slug: 'separator',
    dir: 'Separator',
    name: 'Separator',
    group: 'Display',
    summary: 'A rule, in the three weights a monochrome page needs.',
    when: 'Hairline between rows, edge between blocks, hard under a masthead.',
    accessibility: [
      'role="none" by default. A rule that only groups things visually must not be announced.',
    ],
  },
  {
    slug: 'figure-band',
    dir: 'FigureBand',
    name: 'FigureBand',
    group: 'Display',
    summary: 'A row of counted facts, divided by hairlines and nothing else.',
    accessibility: [
      'A <dl>: each cell is a term and its value, which a grid of divs cannot express.',
    ],
    related: ['table'],
  },

  // ─── Feedback ───
  {
    slug: 'spinner',
    dir: 'Spinner',
    name: 'Spinner',
    group: 'Feedback',
    summary: 'The one “working” indicator — a ring, never a shimmer.',
    when: 'A wait short enough that the shape of what is coming does not matter. Longer than that, use a Skeleton.',
    accessibility: [
      'label names the specific thing being waited on; three spinners all saying “Loading” tell a screen reader nothing.',
      'label={null} silences it for use inside a control that already announces the operation.',
      'Spins under motion-safe only; the static ring still reads as unfinished because the leading quarter is darker.',
    ],
    related: ['skeleton', 'progress'],
  },
  {
    slug: 'skeleton',
    dir: 'Skeleton',
    name: 'Skeleton',
    group: 'Feedback',
    summary: 'The shape of the page, before the page.',
    when: 'A wait the reader would otherwise think was a broken page. A shape that describes what is coming beats a dot that describes nothing.',
    accessibility: [
      'One live region on the wrapper; every shape inside it is aria-hidden.',
      'One pulse on the wrapper, not one per bar, so the page breathes together.',
    ],
    related: ['spinner', 'empty-state'],
  },
  {
    slug: 'progress',
    dir: 'Progress',
    name: 'Progress',
    group: 'Feedback',
    summary: 'A bar that fills, or sweeps when the end is unknown.',
    accessibility: [
      'Omitting value drops aria-valuenow, so a screen reader hears “indeterminate” rather than a number that is a guess.',
      'label is required — a bare bar announces nothing.',
    ],
    related: ['spinner'],
  },
  {
    slug: 'alert',
    dir: 'Alert',
    name: 'Alert',
    group: 'Feedback',
    summary: 'A message about the page, in place.',
    when: 'Something the reader needs to see and may need to act on. Something they only need to notice is a Toast.',
    accessibility: [
      'danger is role="alert" and interrupts; the other three are role="status" and wait for a pause.',
      'Colour is doubled by an icon and by the words.',
    ],
    related: ['toast', 'error-state'],
  },
  {
    slug: 'empty-state',
    dir: 'EmptyState',
    name: 'EmptyState',
    group: 'Feedback',
    summary: 'A collection with nothing in it — yet.',
    when: 'Nothing went wrong. The copy says what to do, not what failed.',
    related: ['error-state', 'skeleton'],
  },
  {
    slug: 'error-state',
    dir: 'ErrorState',
    name: 'ErrorState',
    group: 'Feedback',
    summary: 'A page that could not be shown.',
    accessibility: [
      'The big status code is aria-hidden; the heading immediately after says the same thing in words.',
    ],
    related: ['empty-state', 'alert'],
  },
  {
    slug: 'toast',
    dir: 'Toast',
    name: 'Toast',
    group: 'Feedback',
    summary: 'A transient confirmation, mounted once near the app root.',
    when: 'Something succeeded and needs no response. A toast is dismissed by time, and time is not an acknowledgement.',
    related: ['alert'],
  },

  // ─── Forms ───
  {
    slug: 'field',
    dir: 'Field',
    name: 'Field',
    group: 'Forms',
    summary: 'A labelled form row: label, control, and the one message below it.',
    accessibility: [
      'Generates an id when none is given, so the label always points at something.',
      'Wires aria-describedby, aria-required and aria-invalid onto the control, so validation is announced and not merely drawn.',
      'hint and error are one slot: when a field is wrong, the thing to read is what is wrong with it.',
    ],
    related: ['input', 'select'],
  },
  {
    slug: 'input',
    dir: 'Input',
    name: 'Input',
    group: 'Forms',
    summary: 'A single line of text entry.',
    accessibility: [
      'A placeholder is not a label — it disappears the moment anyone types. Pair with Field.',
    ],
    related: ['field', 'textarea'],
  },
  {
    slug: 'textarea',
    dir: 'Textarea',
    name: 'Textarea',
    group: 'Forms',
    summary: 'Multi-line text entry, resizable vertically only.',
    related: ['input', 'field'],
  },
  {
    slug: 'select',
    dir: 'Select',
    name: 'Select',
    group: 'Forms',
    summary: 'A native <select>, restyled.',
    when: 'Native on purpose: a listbox rebuilt in divs re-implements typeahead, the mobile picker and every platform keyboard convention, for nothing visible in return.',
    related: ['field', 'radio-group'],
  },
  {
    slug: 'checkbox',
    dir: 'Checkbox',
    name: 'Checkbox',
    group: 'Forms',
    summary: 'A choice that takes effect when the form is submitted.',
    when: 'A setting that applies immediately is a Switch.',
    accessibility: [
      'Supports the indeterminate state, which is what a “select all” header needs when only some rows are selected.',
    ],
    related: ['switch', 'radio-group'],
  },
  {
    slug: 'radio-group',
    dir: 'RadioGroup',
    name: 'RadioGroup',
    group: 'Forms',
    summary: 'A set of mutually exclusive choices.',
    accessibility: [
      'One tab stop for the whole group; the arrow keys move between options, per the ARIA radiogroup pattern.',
      'The label is inside the <label>, so the whole row is the click target.',
    ],
    related: ['checkbox', 'select'],
  },
  {
    slug: 'switch',
    dir: 'Switch',
    name: 'Switch',
    group: 'Forms',
    summary: 'A setting that takes effect immediately.',
    when: 'Inside a form with a Save button, a switch is a lie about when the change happened. Use a Checkbox.',
    related: ['checkbox'],
  },

  // ─── Overlays ───
  {
    slug: 'dialog',
    dir: 'Dialog',
    name: 'Dialog',
    group: 'Overlays',
    summary: 'A modal surface: portal, scrim, centred panel.',
    accessibility: [
      'Radix owns the focus trap, Escape, the scroll lock and aria-modal.',
      'A dialog without a visible heading still renders a hidden title, rather than shipping an unnamed modal.',
    ],
    related: ['dropdown-menu', 'tooltip'],
  },
  {
    slug: 'dropdown-menu',
    dir: 'DropdownMenu',
    name: 'DropdownMenu',
    group: 'Overlays',
    summary: 'A menu of actions.',
    when: 'Actions. Items that navigate belong in a nav; items that set a value are a Select or a RadioGroup.',
    accessibility: [
      'Highlight is driven by data-highlighted, which covers hover AND keyboard focus — styling :hover alone leaves the keyboard user unable to see where they are.',
    ],
    related: ['dialog', 'select'],
  },
  {
    slug: 'tooltip',
    dir: 'Tooltip',
    name: 'Tooltip',
    group: 'Overlays',
    summary: 'A short label on hover and on focus.',
    when: 'Never for anything the reader NEEDS: a tooltip is unreachable on touch and invisible while scanning.',
    accessibility: [
      'The trigger is asChild, so the child must be focusable — a div trigger simply has no keyboard tooltip, which this API shape makes obvious rather than silent.',
      'Not an accessible name. An icon-only button still needs its own aria-label.',
    ],
    related: ['dialog'],
  },

  // ─── Navigation ───
  {
    slug: 'tabs',
    dir: 'Tabs',
    name: 'Tabs',
    group: 'Navigation',
    summary: 'One strip, several panels.',
    accessibility: [
      'The strip scrolls rather than wrapping: a wrapped second row moves every tab below it and the reader loses the one they were about to click.',
      '44px tall, because a tab is a pointer target like any other.',
    ],
    related: ['accordion'],
  },
  {
    slug: 'accordion',
    dir: 'Accordion',
    name: 'Accordion',
    group: 'Navigation',
    summary: 'Disclosure rows that open in place.',
    when: 'The marker is a plus, not a chevron: a plus says “this opens”, a chevron says “there is more below”.',
    related: ['tabs'],
  },
  {
    slug: 'breadcrumb',
    dir: 'Breadcrumb',
    name: 'Breadcrumb',
    group: 'Navigation',
    summary: 'Where you are, as a path.',
    accessibility: [
      'The last crumb is text with aria-current="page", never a link to itself.',
      'Separators are aria-hidden, so the trail is not read as “home slash work slash”.',
    ],
    related: ['pagination'],
  },
  {
    slug: 'pagination',
    dir: 'Pagination',
    name: 'Pagination',
    group: 'Navigation',
    summary: 'Numbered pages, with the middle elided.',
    accessibility: [
      'The current page is a button with aria-current, not a styled span — a reader jumping by control needs to find it.',
      'Renders nothing at one page. A pager for a single page is furniture.',
    ],
    related: ['breadcrumb'],
  },
  {
    slug: 'nav-item',
    dir: 'NavItem',
    name: 'NavItem',
    group: 'Navigation',
    summary: 'A row in a sidebar.',
    accessibility: [
      'aria-current="page" and not only a colour: the active row is also carried by weight and a filled ground.',
    ],
    related: ['app-shell'],
  },

  // ─── Surfaces ───
  {
    slug: 'card',
    dir: 'Card',
    name: 'Card',
    group: 'Surfaces',
    summary: 'A bounded surface, with no shadow under it.',
    when: 'A card that needs to read as raised is a plate, which separates by reversal instead of by blur.',
    related: ['table', 'figure-band'],
  },
  {
    slug: 'table',
    dir: 'Table',
    name: 'Table',
    group: 'Surfaces',
    summary: 'A ruled data table that scrolls inside its own box.',
    accessibility: [
      'caption is required: an unnamed table on a page with three tables is unnavigable.',
      'Column labels are <th scope="col">, so a cell can be traced back to its heading.',
    ],
    related: ['card', 'figure-band'],
  },
  {
    slug: 'app-shell',
    dir: 'AppShell',
    name: 'AppShell',
    group: 'Surfaces',
    summary: 'Two columns on a desktop, a drawer on a phone.',
    accessibility: [
      'The drawer closes on Escape as well as on the scrim, so a keyboard user is not stranded inside it.',
      'The scrim is a <button>, because a div with an onClick is neither reachable nor announced.',
    ],
    related: ['nav-item'],
  },
]

export const BY_SLUG = new Map(COMPONENTS.map((entry) => [entry.slug, entry]))

/** Components in sidebar order: groups as declared, entries alphabetical within. */
export function groupedComponents(): { group: ComponentGroup; entries: ComponentEntry[] }[] {
  return GROUPS.map((group) => ({
    group,
    entries: COMPONENTS.filter((entry) => entry.group === group).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })).filter((section) => section.entries.length > 0)
}
