/**
 * The Actions entries, and nothing else.
 *
 * `catalog.mjs` is still the module: it keeps the typedefs, the group list, the
 * slug rule and the axis table, and it assembles `CATALOG` by concatenating these
 * files in `GROUPS` order. Nothing imports this one directly.
 *
 * A group is the unit because an entry is prose, not a row — several paragraphs
 * per component — and ninety-two of them in one file is a file only one person can
 * be writing at a time.
 */

/** @type {import('../catalog.mjs').CatalogEntry[]} */
export const ACTIONS = [
  {
    name: 'Button',
    group: 'Actions',
    summary: 'The system’s action, on the same corner as the field beside it.',
    when: 'Anything that DOES something. If it navigates and looks like text, it is a link, not a ghost button.',
    anatomy: [
      {
        element: 'Control box',
        required: true,
        description:
          'The <button>, the <a> it becomes when given href, or whatever asChild slots in. It carries the variant, the size, and the same --radius corner as the field beside it.',
      },
      {
        element: 'Label',
        description:
          'children, and the accessible name of a text button. It stays put while loading, so the width does not move under the pointer.',
      },
      {
        element: 'Icon',
        description:
          'The same children slot on an iconOnly button: the box goes square, the padding to zero, and nothing text-shaped is left behind for a screen reader.',
      },
      {
        element: 'Keycap',
        description:
          'keycap, after the label — a mono glyph in a bordered box at reduced opacity. Real text, not decoration hidden from assistive tech.',
      },
      {
        element: 'Spinner',
        description:
          'loading, before the label — a Spinner toned to the ground it sits on and passed label={null}, so it is aria-hidden and aria-busy on the control carries the state instead.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Spell out type="submit" on a form’s submit control: the default here is type="button", so the button at the foot of a form looks right and submits nothing.',
      },
      {
        kind: 'do',
        text: 'Keep one primary to a view. variant defaults to primary, so a row written without the prop is a row in which every button claims to be the one thing the screen wants.',
      },
      {
        kind: 'do',
        text: 'Reach for loading rather than swapping the label by hand: it holds the label, sets aria-busy and disables the control in one move, so the box does not collapse under the pointer that just clicked it.',
      },
      {
        kind: 'do',
        text: 'Use href when it navigates and asChild when a router owns the navigation — a <button> whose onClick calls router.push cannot be opened in a new tab, and is announced as a button that goes nowhere.',
      },
      {
        kind: 'dont',
        text: 'asChild passes the styling to the child and nothing else: keycap and loading never reach it, so a loading state written that way shows no spinner and blocks no clicks.',
      },
      {
        kind: 'dont',
        text: 'sm is 36px at the default density, under the 44px md clears on its own — a toolbar built out of sm is a row of targets a thumb misses (WCAG 2.5.5).',
      },
      {
        kind: 'dont',
        text: 'danger is a state, not emphasis. Spent on the merely important action, nothing is left that reads as destructive when one actually is.',
      },
      {
        kind: 'dont',
        text: 'The keycap is not hidden from assistive tech, so the glyph joins the accessible name — the control is read out as “Save S”, and a keycap for a shortcut nothing binds announces a promise the page never keeps.',
      },
    ],
    accessibility: [
      'A native <button> by default, so Enter and Space both fire it.',
      'loading sets aria-busy and disables the control; the label stays, so the box does not collapse under the pointer that just clicked it.',
      'A link cannot be disabled, so href + loading sets aria-disabled and blocks pointer events instead.',
      'iconOnly has no text, so it requires aria-label — the single most common way a design system ships an unusable control.',
    ],
    keyboard: [
      { keys: ['Enter'], does: 'Activates the button.' },
      { keys: ['Space'], does: 'Activates the button. A native <button> answers to both; a styled <div> answers to neither.' },
    ],
    related: ['floating-icon-button', 'spinner'],
  },
  {
    name: 'FloatingIconButton',
    group: 'Actions',
    summary: 'A round action pinned to a screen corner.',
    when: 'A page-level affordance that must stay reachable while the reader scrolls — back to top, a mobile table of contents.',
    anatomy: [
      {
        element: 'Control box',
        required: true,
        description:
          'A real <button type="button">, --control-h-md square with a pill radius, position: fixed to a bottom corner at --z-drawer. There is no asChild and no href here: it cannot become a link.',
      },
      {
        element: 'Icon',
        required: true,
        description:
          'children, and the only thing in the box. Nothing text-shaped renders, so the control is as wide as the square and no wider.',
      },
      {
        element: 'Ground',
        required: true,
        description:
          'A 90% --paper fill over a backdrop blur, with a --rule-2 hairline. The White Reset has no elevation ramp, so the blur and the hairline are what lift it off the page — not a shadow.',
      },
      {
        element: 'Name',
        required: true,
        description:
          'label, set as aria-label. It never renders, so a screen reader has the name and a sighted reader has the glyph alone.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Spell out position — it is required and has no default, and the values are start and end in reading order. The component’s own doc example says position="right", which is not one of them and does not type-check.',
      },
      {
        kind: 'do',
        text: 'Wrap it in a Tooltip when the glyph is not universal: label is aria-label only, so it names the control for a screen reader and for nobody else — and a tooltip does not open on touch, which is where a floating control is most often the only affordance on screen.',
      },
      {
        kind: 'do',
        text: 'Keep it to two. start is deliberately raised to 5rem while end sits at 1.5rem, which is exactly enough clearance for a pair; a third has nowhere left to go, and the corners already compete with a cookie bar and a chat launcher.',
      },
      {
        kind: 'do',
        text: 'Move it with className when the page has a fixed footer — the classes go through tailwind-merge, so className="bottom-24" REPLACES the corner offset rather than losing to it.',
      },
      {
        kind: 'dont',
        text: '--control-h-md is 44px at the default density and 36px under data-density="compact", so a compact page ships the one control a thumb reaches for without looking at eight pixels under the WCAG 2.5.5 floor.',
      },
      {
        kind: 'dont',
        text: 'It is position: fixed, so any ancestor with a transform, filter or backdrop-filter becomes its containing block — put one inside a DialogContent, which centres itself with a translate, and it pins to the panel’s corner instead of the screen’s.',
      },
      {
        kind: 'dont',
        text: 'It sits at --z-drawer, 100, and every rank that can appear over it is higher: a scrim is 200, a modal 210, an anchored panel 220 — --z-dropdown now resolves to --z-anchored, not to this rank. So a menu opening into the same corner covers the button outright rather than tying with it, and a dialog covers it too. Nothing here is settled by document order; move the button with className if it must stay reachable beside something else.',
      },
    ],
    accessibility: [
      'label is the only name the control has; it is required rather than optional.',
      '44px square, which is the pointer-target floor (WCAG 2.5.8).',
    ],
    related: ['button'],
  },
]
