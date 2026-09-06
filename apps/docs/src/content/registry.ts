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

/**
 * The sidebar's order, and it is an argument rather than an alphabet: a reader
 * arrives wanting to DO something, then to move, then to be interrupted, then
 * to be told what happened — and only after all of that to arrange and to
 * display. Alphabetical would put Actions beside Charts and call it a
 * taxonomy.
 *
 * `Data` and `Charts` are two groups rather than one, and the line between
 * them is not cosmetic: everything in `Charts` needs the `recharts` peer
 * dependency, and nothing in `Data` does. A reader who cannot add a rendering
 * engine can still use every entry in the first of the two.
 */
export const GROUPS = [
  'Actions',
  'Forms',
  'Navigation',
  'Overlays',
  'Feedback',
  'Display',
  'Surfaces',
  'Data',
  'Charts',
] as const

export type ComponentGroup = (typeof GROUPS)[number]

export interface ComponentEntry {
  /** URL segment. */
  slug: string
  /** Directory under packages/design/src/components or src/charts — the generated-data key. */
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
  /**
   * The keyboard contract, key by key.
   *
   * Written out rather than left implied, because "it is accessible" is not
   * something a reader can act on and "Escape closes it, and focus returns to
   * the trigger" is. It is also the part that quietly regresses: a wrapper that
   * swallows a key looks identical until someone tries it.
   */
  keyboard?: { keys: string[]; does: string }[]
  /**
   * Extra room the preview needs.
   *
   * A component that opens a panel — a date picker, a combobox — draws it
   * against the trigger, which on a page means "just below the field" and in a
   * short preview card means "over whatever is underneath". This is the card
   * reserving the space the open state will use, so the example reads as it
   * would in an app rather than as something spilling out of its box.
   *
   * A Tailwind class, because it is a layout decision and belongs in the same
   * vocabulary as the rest of them.
   */
  previewHeight?: string
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
    keyboard: [
      { keys: ['Enter'], does: 'Activates the button.' },
      { keys: ['Space'], does: 'Activates the button. A native <button> answers to both; a styled <div> answers to neither.' },
    ],
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
    summary: 'A choice from a list, styled the whole way down.',
    when: 'Up to roughly a dozen options. Past that a Combobox wins, because a list nobody can filter is slower to scan than one you can type into.',
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'The option list is ours, so it does not change typeface, spacing and selection colour the moment it opens — which is what a native select does.',
      'The keyboard contract is the platform\'s: typeahead, arrows, Home and End, Escape to close without choosing.',
      'label is required. The trigger shows a value, and a value is not a name.',
    ],
    related: ['combobox', 'native-select', 'field'],
    keyboard: [
      { keys: ['Enter', 'Space', '↓'], does: 'Opens the list.' },
      { keys: ['↑', '↓'], does: 'Moves between options.' },
      { keys: ['a–z'], does: 'Typeahead — jumps to the next option starting with that letter.' },
      { keys: ['Home', 'End'], does: 'Jumps to the first or last option.' },
      { keys: ['Escape'], does: 'Closes without choosing.' },
    ],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'native-select',
    dir: 'NativeSelect',
    name: 'NativeSelect',
    group: 'Forms',
    summary: 'The platform’s own picker, restyled where it can be.',
    when: 'The escape hatch, not the default. Reach for it where the platform genuinely wins: a very long list on a phone, a form that must work without JavaScript, a page counting its last kilobyte.',
    accessibility: [
      'Typeahead and the mobile wheel come free, from the browser.',
      'What it cannot do is look like the rest of the system once open — the option list is drawn by the operating system and carries none of these tokens.',
    ],
    keyboard: [
      { keys: ['Space', '↓'], does: 'Opens the platform picker.' },
      { keys: ['a–z'], does: 'Typeahead, from the browser’s own implementation.' },
    ],
    related: ['select', 'field'],
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
    keyboard: [
      { keys: ['Space'], does: 'Toggles it.' },
    ],
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
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the group, and out of it — the whole group is one stop.' },
      { keys: ['↑', '↓', '←', '→'], does: 'Moves between options AND selects as it goes.' },
    ],
  },
  {
    slug: 'switch',
    dir: 'Switch',
    name: 'Switch',
    group: 'Forms',
    summary: 'A setting that takes effect immediately.',
    when: 'Inside a form with a Save button, a switch is a lie about when the change happened. Use a Checkbox.',
    related: ['checkbox'],
    keyboard: [
      { keys: ['Space', 'Enter'], does: 'Toggles it, and the change applies immediately.' },
    ],
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
    keyboard: [
      { keys: ['Escape'], does: 'Closes it, and focus returns to the trigger it came from.' },
      { keys: ['Tab'], does: 'Cycles inside the dialog; focus cannot leave while it is open.' },
    ],
  },
  {
    slug: 'dropdown-menu',
    dir: 'DropdownMenu',
    name: 'DropdownMenu',
    group: 'Overlays',
    summary: 'A menu of actions.',
    when: 'Actions. Items that navigate belong in a nav; items that set a value are a Select or a RadioGroup.',
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'Highlight is driven by data-highlighted, which covers hover AND keyboard focus — styling :hover alone leaves the keyboard user unable to see where they are.',
    ],
    related: ['dialog', 'select'],
    keyboard: [
      { keys: ['Enter', 'Space', '↓'], does: 'Opens the menu and lands on the first item.' },
      { keys: ['↑', '↓'], does: 'Moves between items.' },
      { keys: ['a–z'], does: 'Jumps to the next item starting with that letter.' },
      { keys: ['Escape'], does: 'Closes the menu and returns focus to the trigger.' },
    ],
    previewHeight: 'min-h-[18rem]',
  },
  {
    slug: 'tooltip',
    dir: 'Tooltip',
    name: 'Tooltip',
    group: 'Overlays',
    summary: 'A short label on hover and on focus.',
    when: 'Never for anything the reader NEEDS: a tooltip is unreachable on touch and invisible while scanning.',
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'The trigger is asChild, so the child must be focusable — a div trigger simply has no keyboard tooltip, which this API shape makes obvious rather than silent.',
      'Not an accessible name. An icon-only button still needs its own aria-label.',
    ],
    related: ['dialog'],
    keyboard: [
      { keys: ['Tab'], does: 'Shows the tip — focus reveals it, not only hover.' },
      { keys: ['Escape'], does: 'Dismisses it.' },
    ],
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
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the strip, and out of it — the whole strip is one stop.' },
      { keys: ['←', '→'], does: 'Moves between tabs and switches the panel with them.' },
      { keys: ['Home', 'End'], does: 'Jumps to the first or last tab.' },
    ],
  },
  {
    slug: 'accordion',
    dir: 'Accordion',
    name: 'Accordion',
    group: 'Navigation',
    summary: 'Disclosure rows that open in place.',
    when: 'The marker is a plus, not a chevron: a plus says “this opens”, a chevron says “there is more below”.',
    related: ['tabs'],
    keyboard: [
      { keys: ['Tab'], does: 'Moves between rows.' },
      { keys: ['Enter', 'Space'], does: 'Opens or closes the focused row.' },
    ],
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
    keyboard: [
      { keys: ['Tab'], does: 'Reaches every control, including the current page.' },
      { keys: ['Enter', 'Space'], does: 'Goes to that page.' },
    ],
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
    group: 'Data',
    summary: 'A ruled data table — alignment, sorting and rules all per column.',
    when: 'Alignment is per column and numbers belong at the end edge, so digits line up. Sorting is opt-in per column: a table where every header is a button invites sorting a column the data cannot be ordered by.',
    accessibility: [
      'caption is required: an unnamed table on a page with three tables is unnavigable.',
      'Column labels are <th scope="col">, so a cell can be traced back to its heading.',
      'A sortable header is a button INSIDE the th, not a click handler on the cell — a cell with an onClick is not focusable and not announced, so the sort would exist only for a mouse.',
      'aria-sort is set from sortDirection, which is the only way a screen reader learns the table is ordered at all.',
      'No zebra striping at any border setting: in a monochrome system a striped row is a second surface competing with the page ground.',
    ],
    related: ['card', 'figure-band'],
    keyboard: [
      { keys: ['Tab'], does: 'Reaches the scroll region, and each sortable column header.' },
      { keys: ['←', '→'], does: 'Scrolls the table sideways once the region has focus.' },
    ],
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
  // ─── Forms (continued) ───
  {
    slug: 'combobox',
    dir: 'Combobox',
    name: 'Combobox',
    group: 'Forms',
    summary: 'A select you can type into.',
    when: 'Past roughly a dozen options. Below that a native Select is better: the platform picker on a phone, typeahead for free, no JavaScript.',
    accessibility: [
      'The highlight moves through aria-activedescendant while focus stays in the input — the ARIA combobox pattern. Hand-rolled comboboxes move focus into the list, and the typed text stops being editable.',
      'label is required: the trigger prints a value, and a value is not a name.',
    ],
    related: ['select', 'command'],
    keyboard: [
      { keys: ['Enter', 'Space', '↓'], does: 'Opens the list.' },
      { keys: ['↑', '↓'], does: 'Moves the highlight while focus stays in the filter.' },
      { keys: ['Enter'], does: 'Chooses the highlighted option; choosing the current one clears it.' },
      { keys: ['Escape'], does: 'Closes without choosing.' },
    ],
    previewHeight: 'min-h-[28rem]',
  },
  {
    slug: 'date-picker',
    dir: 'DatePicker',
    name: 'DatePicker',
    group: 'Forms',
    summary: 'A date — or a span of them — chosen from a calendar.',
    when: 'Deliberately not a text input with a calendar attached: parsing a typed date needs a format, and 03/04 is March the fourth in one country and the third of April in the next. When the date is a long way back, the calendar’s month and year are dropdowns.',
    accessibility: [
      'The trigger prints the date in the visitor’s own locale, not a fixed dd/mm/yyyy.',
      'DateRangePicker keeps the panel open until both ends are chosen — a range is not a value until it has a second date.',
      'The shortcut rail is plain buttons, not a menu: they set the same value the grid beside them sets, so they belong to one control and Tab in the same pass.',
      'Presets are computed on click, so “today” means today even on a tab left open overnight.',
    ],
    related: ['calendar', 'field'],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens the calendar.' },
      { keys: ['Escape'], does: 'Closes it without choosing.' },
    ],
    previewHeight: 'min-h-[26rem]',
  },
  {
    slug: 'slider',
    dir: 'Slider',
    name: 'Slider',
    group: 'Forms',
    summary: 'A value chosen along a range.',
    accessibility: [
      'label is required. A thumb that announces "42" and nothing else leaves a screen reader user with a number and no idea what it measures.',
      'A 44px hit area sits invisibly around the 16px thumb.',
      'Arrows step, Page keys jump, Home and End reach the ends.',
    ],
    related: ['progress'],
    keyboard: [
      { keys: ['←', '→'], does: 'Moves by one step.' },
      { keys: ['Page Up', 'Page Down'], does: 'Moves by a larger step.' },
      { keys: ['Home', 'End'], does: 'Jumps to the minimum or maximum.' },
    ],
  },
  {
    slug: 'toggle-group',
    dir: 'ToggleGroup',
    name: 'ToggleGroup',
    group: 'Forms',
    summary: 'A segmented control: several options, one strip.',
    when: 'It changes a VALUE. Something that switches panels is Tabs.',
    accessibility: [
      'type="single" gets radio semantics; type="multiple" gets independent toggles. Choosing wrong tells a screen reader that picking one option unpicks the others.',
    ],
    related: ['tabs', 'radio-group'],
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the strip — one stop for the group.' },
      { keys: ['←', '→'], does: 'Moves between segments.' },
      { keys: ['Enter', 'Space'], does: 'Toggles the focused segment.' },
    ],
  },

  // ─── Overlays (continued) ───
  {
    slug: 'popover',
    dir: 'Popover',
    name: 'Popover',
    group: 'Overlays',
    summary: 'A panel anchored to a control, holding content you can interact with.',
    when: 'Anything with a link, a field or a button in it. A tooltip describes and cannot be entered — put a control inside one and it becomes unreachable.',
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'label is required: a popover is a dialog, and an unnamed one announces nothing.',
      'Its contents Tab like the rest of the page, unlike a menu’s arrow-key list.',
    ],
    related: ['tooltip', 'dropdown-menu'],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens it.' },
      { keys: ['Tab'], does: 'Moves through its contents like the rest of the page.' },
      { keys: ['Escape'], does: 'Closes it and returns focus to the trigger.' },
    ],
    previewHeight: 'min-h-[20rem]',
  },
  {
    slug: 'sheet',
    dir: 'Sheet',
    name: 'Sheet',
    group: 'Overlays',
    summary: 'A panel docked to an edge of the viewport.',
    when: 'A modal that needs room — a filter panel, a detail view. It IS a Dialog, docked; the sides are named in reading order, so `end` is the right in English and the left in Arabic.',
    accessibility: [
      'Shares Dialog’s focus trap, Escape handling and scroll lock rather than reproducing them — a second focus trap is a second one to get wrong.',
      'The title is required, visible or not.',
    ],
    related: ['dialog', 'popover'],
    keyboard: [
      { keys: ['Escape'], does: 'Closes it, and focus returns to the trigger.' },
      { keys: ['Tab'], does: 'Cycles inside the sheet.' },
    ],
  },
  {
    slug: 'context-menu',
    dir: 'ContextMenu',
    name: 'ContextMenu',
    group: 'Overlays',
    summary: 'The menu a right-click opens.',
    when: 'Never as the only way to reach an action. Touch users, trackpad users and keyboard users may have no way to open it.',
    related: ['dropdown-menu'],
    keyboard: [
      { keys: ['Shift', 'F10'], does: 'Opens the menu from the keyboard, where the platform supports it.' },
      { keys: ['↑', '↓'], does: 'Moves between items.' },
      { keys: ['Escape'], does: 'Closes it.' },
    ],
    previewHeight: 'min-h-[20rem]',
  },
  {
    slug: 'searchable-menu',
    dir: 'SearchableMenu',
    name: 'SearchableMenu',
    group: 'Overlays',
    summary: 'A menu of actions you can type into.',
    when: 'A DropdownMenu past about a dozen rows stops being scannable, and nesting submenus makes it worse. This is the same list with a filter over it. Not a Command palette: that is page-level and modal; this is anchored to a control.',
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'The rows are options inside a listbox rather than menuitems, because filtering requires it — the highlight moves through aria-activedescendant while focus stays in the input, and a menu cannot do that.',
      'The trade is deliberate: a menu that cannot be filtered is worse for the reader than a listbox that runs actions.',
    ],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens the menu.' },
      { keys: ['↑', '↓'], does: 'Moves the highlight while focus stays in the filter.' },
      { keys: ['Enter'], does: 'Runs the highlighted action.' },
      { keys: ['Escape'], does: 'Closes without running anything.' },
    ],
    previewHeight: 'min-h-[26rem]',
    related: ['dropdown-menu', 'command', 'combobox'],
  },
  {
    slug: 'command',
    dir: 'Command',
    name: 'Command',
    group: 'Overlays',
    summary: 'A filterable list of actions — the ⌘K surface.',
    accessibility: [
      'The list filters as you type, the highlight moves with the arrow keys, and focus stays in the input. That last part is the ARIA combobox pattern and the part a home-made palette gets wrong.',
    ],
    related: ['combobox', 'dialog'],
    keyboard: [
      { keys: ['↑', '↓'], does: 'Moves the highlight. Focus stays in the input, so what you typed stays editable.' },
      { keys: ['Enter'], does: 'Runs the highlighted item.' },
      { keys: ['Escape'], does: 'Closes the palette.' },
    ],
    previewHeight: 'min-h-[24rem]',
  },

  // ─── Navigation (continued) ───
  {
    slug: 'collapsible',
    dir: 'Collapsible',
    name: 'Collapsible',
    group: 'Navigation',
    summary: 'One thing that opens, on its own.',
    when: 'The difference from Accordion is arithmetic: an accordion is a SET and can coordinate. An accordion of one manages a value nobody reads.',
    related: ['accordion'],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens or closes it.' },
    ],
  },

  // ─── Surfaces (continued) ───
  {
    slug: 'calendar',
    dir: 'Calendar',
    name: 'Calendar',
    group: 'Surfaces',
    summary: 'A month, as a grid of days.',
    when: 'On its own for a range view or an availability grid; inside a DatePicker for choosing one.',
    accessibility: [
      'Arrows move a day, Page keys move a month, Home and End reach the week’s ends.',
      '“Today” is an outline and “selected” is a fill — one is a fact about the calendar, the other a choice the reader made, and they must not look alike.',
      'Month and year are the system’s own Select, not the platform’s: a native list of a hundred years is a scroll rather than a choice, and it arrives styled by the operating system.',
      'The default span is ten years either side. A birth date needs a wider one, and asks for it with startMonth.',
    ],
    related: ['date-picker'],
    keyboard: [
      { keys: ['←', '→'], does: 'Moves by a day.' },
      { keys: ['↑', '↓'], does: 'Moves by a week.' },
      { keys: ['Page Up', 'Page Down'], does: 'Moves by a month.' },
      { keys: ['Home', 'End'], does: 'Jumps to the week\'s first or last day.' },
      { keys: ['Enter', 'Space'], does: 'Chooses the focused day.' },
    ],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'scroll-area',
    dir: 'ScrollArea',
    name: 'ScrollArea',
    group: 'Surfaces',
    summary: 'A box that scrolls, with a scrollbar that looks the same everywhere.',
    when: 'A bounded panel — a long option list, a log. For page-level or prose scroll the scroll-slim utility is lighter and needs no component.',
    accessibility: [
      'The viewport stays focusable. A scrollable region whose contents are not focusable has nothing to Tab to, so everything past the fold does not exist without a mouse.',
      'label is required, because an unnamed keyboard stop announces "group" and nothing else.',
    ],
    related: ['table'],
    keyboard: [
      { keys: ['Tab'], does: 'Moves focus into the region, which is what makes it scrollable at all without a mouse.' },
      { keys: ['↑', '↓', 'Page Up', 'Page Down'], does: 'Scrolls it.' },
    ],
  },

  // ─── Charts ───
  // Every entry below ships from `@misoto22/design/charts`, with recharts and
  // motion as peer dependencies, and reads the series ramp in tokens.css rather
  // than defining a colour of its own. Heatmap and Sparkline are the exceptions
  // and sit under Data, because neither needs an engine.
  {
    slug: 'area-chart',
    dir: 'AreaChart',
    name: 'AreaChart',
    group: 'Charts',
    summary: 'A filled series over a continuous axis, where the area means something.',
    when: 'Reading one magnitude over time. Comparing several series against each other is a LineChart — four translucent fills stacked on each other answer neither question.',
    accessibility: [
      'title is required and becomes the figure’s accessible name, printed or not.',
      'The rows are rendered again as a visually hidden table, so the numbers are reachable rather than only drawn. hideDataTable opts out when the page already prints them.',
      'Six fill variants exist because in the monochrome default TEXTURE is the primary carrier of identity and the grey ramp is the second — which is also what keeps two series apart in greyscale print and under forced colours.',
      'The intro reveal is a per-frame SVG mask and is dropped entirely under prefers-reduced-motion, as is the crawling dash.',
    ],
    related: ['line-chart', 'bar-chart', 'composed-chart'],
    keyboard: [
      { keys: ['Tab'], does: 'Reaches the plot, which Recharts’ accessibility layer makes navigable.' },
      { keys: ['←', '→'], does: 'Moves the cursor between points, announcing each.' },
    ],
    previewHeight: 'min-h-[22rem]',
  },
  {
    slug: 'bar-chart',
    dir: 'BarChart',
    name: 'BarChart',
    group: 'Charts',
    summary: 'Discrete categories compared by length.',
    when: 'The categories are buckets rather than a continuum. If the axis is time and the reader is following a trend, an AreaChart or LineChart reads it faster.',
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'Every bar carries an invisible full-height hit rectangle, so a 3px bar at the bottom of the scale is as easy to hit as a full-height one.',
      'A clickable legend entry is a real button with aria-pressed, not a div with a click handler.',
      'The staggered grow-in is anchored to the chart’s own start rather than to each bar’s mount, so a hover cannot replay it — and reduce-motion drops it entirely.',
    ],
    related: ['area-chart', 'composed-chart', 'radial-chart'],
    previewHeight: 'min-h-[22rem]',
  },
  {
    slug: 'line-chart',
    dir: 'LineChart',
    name: 'LineChart',
    group: 'Charts',
    summary: 'Several series compared over a continuous axis.',
    when: 'The reader is comparing series against each other. When the area under one line is the point, fill it — that is an AreaChart.',
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'A clickable line gets a 15px transparent line underneath it, because a 1.6px stroke is not a pointer target.',
      'buffer draws the last segment dashed by measuring the real path length, so a projection is visibly a different kind of fact at any curve type.',
    ],
    related: ['area-chart', 'composed-chart'],
    previewHeight: 'min-h-[22rem]',
  },
  {
    slug: 'composed-chart',
    dir: 'ComposedChart',
    name: 'ComposedChart',
    group: 'Charts',
    summary: 'Bars and lines over one axis — the volume, and the rate it moved at.',
    when: 'Two measures that share a scale. Two that do NOT share one belong in two charts or indexed to a common base: there is no second y-axis here, on purpose.',
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'One value axis only. A dual-axis chart lets its author choose where the lines cross, which is the single most misleading thing a chart can do.',
      'enableHoverHighlight dims every bar outside the hovered column, driven by the chart’s own tooltip index.',
    ],
    related: ['bar-chart', 'line-chart'],
    previewHeight: 'min-h-[22rem]',
  },
  {
    slug: 'pie-chart',
    dir: 'PieChart',
    name: 'PieChart',
    group: 'Charts',
    summary: 'Parts of one whole.',
    when: 'Roughly what share, and nothing more precise. Ranking or comparing wedges — especially across two pies — is a BarChart’s job.',
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'The legend sits under the pie by default, because a pie has no category axis naming its sectors.',
      'Compose a Label to print the numbers on the wedges: a pie’s weakness is that an angle is hard to read, and a printed number removes the guess.',
      'One fill variant, deliberately. A wedge is small and awkwardly shaped, and a texture inside one reads as noise.',
    ],
    related: ['radial-chart', 'bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'radar-chart',
    dir: 'RadarChart',
    name: 'RadarChart',
    group: 'Charts',
    summary: 'A profile across several named dimensions.',
    when: 'Recognising a silhouette. The area a radar encloses depends on the order its spokes happen to be in, so it is the wrong chart for comparing magnitudes.',
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'Two or three series at most: filled polygons overlap, and judging areas through two layers of translucency is what a radar is worst at. Past that, variant="lines".',
    ],
    related: ['line-chart', 'pie-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'radial-chart',
    dir: 'RadialChart',
    name: 'RadialChart',
    group: 'Charts',
    summary: 'Values on an arc — a gauge, or a few totals against one scale.',
    when: 'A single value against a fixed total. Past about four bars a BarChart is the honest choice, because a radial bar’s radius is not its value.',
    accessibility: [
      'title is required; pass valueKey and the rows are also rendered as a visually hidden table.',
      'Set max or the scale comes from the data and the largest bar always fills the arc — which makes 62% and 98% look identical.',
      'showTrack draws the unfilled remainder, which is what makes a gauge readable at all.',
    ],
    related: ['pie-chart', 'bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'sankey-chart',
    dir: 'SankeyChart',
    name: 'SankeyChart',
    group: 'Charts',
    summary: 'Where a quantity goes as it moves through stages.',
    when: 'A funnel, a budget, an energy or traffic breakdown. The only chart here whose data is a graph rather than a table.',
    accessibility: [
      'title is required. The hidden table lists the FLOWS rather than the nodes — a table of node totals would lose every “from → to” the diagram exists to show.',
      'Four link variants: gradient reads as flow, source and target attribute a band to one end, solid gives up colour and lets the nodes carry identity.',
    ],
    related: ['bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },

  // ─── Charts (continued) ───
  {
    slug: 'scatter-chart',
    dir: 'ScatterChart',
    name: 'ScatterChart',
    group: 'Charts',
    summary: 'Two measures against each other, one mark per observation.',
    when: 'Correlation, clustering, outliers — the questions that do not survive being bucketed into a bar. The only chart here whose x axis is a number rather than a category.',
    accessibility: [
      'title is required. The table view is declared rather than inferred: scatter data lives on each series, so there is no single set of rows to read off the root.',
      'Shape does the work hue does elsewhere. Two overlapping clouds separate far better by circle-versus-cross than by two steps of grey — and shape survives overprinting, which a lightness step does not.',
      'A solid mark carries a surface-coloured ring, so two observations that land on top of each other stay countable.',
      'ZAxis maps its measure to a mark’s AREA, not its radius: doubling a radius quadruples the ink, which is the most common way a bubble chart lies.',
    ],
    related: ['line-chart', 'heatmap'],
    previewHeight: 'min-h-[22rem]',
  },
  {
    slug: 'funnel-chart',
    dir: 'FunnelChart',
    name: 'FunnelChart',
    group: 'Charts',
    summary: 'Stages that only ever narrow.',
    when: 'A signup flow, a hiring pipeline, a checkout. When the flow can SPLIT rather than only shrink, it is a SankeyChart — a funnel has one path through it by construction.',
    accessibility: [
      'title is required; the stages are also rendered as a visually hidden table.',
      'The taper encodes a ratio between neighbouring stages and the eye reads the enclosed area, so a funnel exaggerates a shallow drop. Compose a Label to print the numbers — that is the relief.',
      'The default variant holds one fill for every stage and lets the shape carry the drop. A ramp that also darkens each stage encodes the same fact twice.',
    ],
    related: ['sankey-chart', 'bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'treemap-chart',
    dir: 'TreemapChart',
    name: 'TreemapChart',
    group: 'Charts',
    summary: 'Part of a whole, when the whole has too many parts for a pie — and the parts nest.',
    when: 'Fifty items where a pie fails at six. Under a dozen items with a ranking to read, a BarChart’s length is the more precise encoding.',
    accessibility: [
      'title is required. The table view lists the LEAVES with the path that names them: a nested tree read row by row is not something anyone can follow.',
      'Area is the encoding, so the data must be non-negative and must sum to something the reader recognises as the whole.',
      'The gap between tiles is a surface-coloured stroke rather than a smaller rect — a treemap whose parts do not touch stops reading as a partition.',
    ],
    related: ['pie-chart', 'bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },

  {
    slug: 'box-plot',
    dir: 'BoxPlot',
    name: 'BoxPlot',
    group: 'Charts',
    summary: 'The spread of a measurement, per category.',
    when: 'How variable is this, across six things at once. When the shape of ONE distribution is the question it wants a Histogram; when there are few enough observations to draw them all, a ScatterChart.',
    accessibility: [
      'A box is five numbers, and five numbers cannot tell one hump from two. A bimodal distribution draws exactly the same box as a smooth one centred in the same place — the component says so in its own description rather than in a footnote.',
      'It also hides sample size: a box over six points and a box over six thousand are drawn identically. Carry count, and turn on notched whenever medians are being compared.',
      'Raw values are summarised with Tukey’s fences, which is stated on the page rather than assumed — a different fence rule draws different outliers from the same data.',
      'The hidden data table carries all five numbers per category, so the figure is readable without seeing the glyph.',
    ],
    related: ['histogram', 'scatter-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'histogram',
    dir: 'Histogram',
    name: 'Histogram',
    group: 'Charts',
    summary: 'The shape of one distribution.',
    when: 'A single distribution has to be understood — two clusters, a hard floor, a pile-up at a timeout. Several distributions side by side want a BoxPlot.',
    accessibility: [
      'The shape is a property of the bin width, not only of the data: the same numbers cut into eight buckets and into eighty are two different pictures. The rule that drew it — Freedman–Diaconis by default — is named on the page.',
      'The x axis is numeric and every bar is drawn from its own two edges, so an uneven bucket is as wide as it really is rather than flattened into an equal slot.',
      'mode="density" corrects the trap uneven buckets create: under frequency a bucket twice as wide stands twice as tall at the same underlying rate.',
      'The hidden data table prints each bucket’s two edges and its count, which is the only exact reading a binned chart can offer.',
    ],
    related: ['box-plot', 'bar-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'waterfall-chart',
    dir: 'WaterfallChart',
    name: 'WaterfallChart',
    group: 'Charts',
    summary: 'How a total got from one figure to another.',
    when: '“Why did this change”, where the contributions can be negative. A pie cannot hold a negative slice; a BarChart is right when the parts need not add up to the gap between two totals.',
    accessibility: [
      'The connectors draw the steps as a sequence, and most breakdowns are not sequential — churn and expansion in the same month are simultaneous, and a reader takes the leftmost bar as the first cause. Where the order is arbitrary, say so in description.',
      'Intermediate bars are floating lengths read against no baseline, so a small step high up the cascade is hard to compare with a large one near zero. Total bars sit on the axis and are the only ones a reader can read absolutely.',
      'Direction is carried by the label’s sign and the bar’s texture as well as its position, so the reading survives greyscale and forced colours.',
      'A closing bar with no value is computed from the deltas, which keeps the arithmetic in the data rather than in the caller’s head.',
    ],
    related: ['bar-chart', 'funnel-chart'],
    previewHeight: 'min-h-[24rem]',
  },
  {
    slug: 'facet',
    dir: 'Facet',
    name: 'Facet',
    group: 'Charts',
    summary: 'The same chart once per group, on one shared scale.',
    when: 'Eight series overplot into a hairball in one frame. Two or three series that genuinely need comparing point-for-point still belong in one chart.',
    accessibility: [
      'The shared domain is the default and the whole point: on independent scales a group peaking at 40 and one peaking at 4,000 draw the same shape, and the comparison the reader came for is not merely lost but inverted.',
      'Every panel is a figure with its own accessible name, so a screen reader walks eight named charts rather than one unnamed grid.',
      'Panels beyond max fold into a stated overflow rather than being dropped, and the count is printed — a grid silently missing four groups is not something a reader can detect.',
      'Panel order is a choice the call site makes explicitly through sort, because reading order is what a reader takes as ranking.',
    ],
    related: ['line-chart', 'sparkline'],
    previewHeight: 'min-h-[28rem]',
  },

  // ─── Data (continued) ───
  {
    slug: 'heatmap',
    dir: 'Heatmap',
    name: 'Heatmap',
    group: 'Data',
    summary: 'A grid of values read by weight.',
    when: 'A calendar of activity, a confusion matrix, an hour-by-weekday load. The one form a monochrome system renders better than a chromatic one.',
    accessibility: [
      'A real <table>, not an SVG: the structure a screen reader walks is the structure the eye reads, and every cell announces its own row, column and value.',
      'Lightness is the only channel that is unambiguously ordered, which is why the standing advice everywhere else is “one hue, light to dark”. Here there is no hue left to get wrong.',
      'A null is drawn as a dashed outline, never as the palest cell — a missing reading is not a zero.',
      'Pin domain whenever two grids are compared: on independent domains they look alike and mean different things, which is the one failure a shared legend cannot fix.',
    ],
    related: ['table', 'scatter-chart'],
  },
  {
    slug: 'sparkline',
    dir: 'Sparkline',
    name: 'Sparkline',
    group: 'Data',
    summary: 'A run of numbers at the size of a word.',
    when: 'In a table cell, beside a figure, at the end of a row. When the trend needs reading precisely it wants a LineChart and its own space.',
    accessibility: [
      'label is required and is the whole accessible name: a sparkline has no axes and no legend, so nothing else describes it.',
      'Axis-less by design. Every piece of chrome that would let it answer “what value exactly” also makes it too big to sit inline, which was the only reason to reach for it.',
      'Pin domain for a column of them: on independent domains every row peaks and troughs identically, which is how a table of sparklines becomes actively misleading.',
      'One path, no rendering engine — so a hundred of them in a table cost nothing.',
    ],
    related: ['line-chart', 'table'],
  },
  {
    slug: 'bar-list',
    dir: 'BarList',
    name: 'BarList',
    group: 'Data',
    summary: 'A ranked list, with the bar behind the name rather than beside it.',
    when: 'Top referrers, slowest endpoints, biggest accounts. A horizontal BarChart spends a third of its width on an axis repeating labels the rows could simply contain.',
    accessibility: [
      'A real <table> with two columns and one row per thing, because that is what a ranked list is. The bar is a background on the name cell, so it is never a second element a screen reader has to walk past.',
      'limit sums the tail into an “Other” row rather than dropping it — a top five that silently discards the other forty misstates the whole, and the reader has no way to tell.',
      'Pin max to compare two lists side by side: on independent scales the leading row of each fills its track, and two very different numbers look identical.',
    ],
    related: ['bar-chart', 'table'],
  },
  {
    slug: 'big-number',
    dir: 'BigNumber',
    name: 'BigNumber',
    group: 'Data',
    summary: 'One number, at the size of a headline.',
    when: 'There is exactly one figure to report. A plot of a single value is a plot whose shape carries nothing, and the reader has to decode an axis to recover a number that could simply have been printed.',
    accessibility: [
      'The delta’s direction is stated by the call site through intent, never inferred from the sign: “errors down 12%” is good news and “revenue down 12%” is not, and no component can tell which it is holding.',
      'The arrow and the words carry the direction; the status tint is the third signal, never the only one — so the reading survives greyscale, forced colours and colour blindness.',
      'value is taken already formatted. The component does not guess a unit, a currency or a locale.',
    ],
    related: ['sparkline', 'figure-band'],
  },
  {
    slug: 'bullet-chart',
    dir: 'BulletChart',
    name: 'BulletChart',
    group: 'Data',
    summary: 'A measure, its target, and the bands that say whether it is any good.',
    when: 'A status page of ten tracked numbers. Stephen Few designed it to replace the dashboard gauge, which spends a whole card saying one number badly.',
    accessibility: [
      'Plain HTML with logical properties — no rendering engine, server-renderable, and correct in a right-to-left document. Usable with recharts absent.',
      'The bands are a JUDGEMENT drawn in the same ink as the measurement, so the page has to say where they came from. Ranges that encode nothing but thirds make the chart look evaluated when it is not.',
      'It shows one instant and no change over time; target is the only comparison it carries. “How did we get here” wants a LineChart.',
      'Shared bands only mean something when the measures share a scale — a latency beside a conversion rate needs ranges and domain per measure.',
    ],
    related: ['bar-list', 'big-number'],
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
