/**
 * The Navigation entries, and nothing else.
 *
 * `catalog.mjs` is still the module: it keeps the typedefs, the group list, the
 * slug rule and the axis table, and it assembles `CATALOG` by concatenating these
 * files in `GROUPS` order. Nothing imports this one directly.
 *
 * A group is the unit because an entry is prose, not a row — several paragraphs
 * per component — and fifty-two of them in one file is a file only one person can
 * be writing at a time.
 */

/** @type {import('../catalog.mjs').CatalogEntry[]} */
export const NAVIGATION = [
  {
    name: 'Tabs',
    group: 'Navigation',
    summary: 'One strip, several panels.',
    anatomy: [
      {
        element: 'Root',
        required: true,
        description:
          'Tabs — Radix’s root, re-exported. It draws nothing and owns everything: value or defaultValue, and activationMode. With neither value nor defaultValue no tab is selected and no panel is mounted.',
      },
      {
        element: 'Tab strip',
        required: true,
        description:
          'TabsList — the role="tablist" row, sitting on one hairline rule and scrolling on its own axis with scroll-slim. It has no accessible name unless you give it one.',
      },
      {
        element: 'Tab',
        required: true,
        description:
          'TabsTrigger, at the md control height with its label on one line. Every tab carries the 2px active marker, transparent until it is the selected one; the marker is pulled onto the strip’s own border with -mb-px so the two share a line rather than stacking into a 3px edge.',
      },
      {
        element: 'Panel',
        description:
          'TabsContent, paired to its tab by matching value. Mounted only while it is the selected one, and marked data-m22-animated so its entrance is dropped for a reader who asked for less motion.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Give the root a defaultValue or a value: with neither, nothing matches, every panel stays unmounted, and the page renders a strip above an empty space with nothing to say what is missing.',
      },
      {
        kind: 'do',
        text: 'Match each trigger’s value to a panel’s value exactly — the pairing is string equality, and a typo is not an error but a tab that opens onto nothing.',
      },
      {
        kind: 'do',
        text: 'Pass activationMode="manual" when a panel fetches or renders something expensive: the default is automatic, so ← and → select as they move and arrowing across four tabs starts four loads before the reader has stopped.',
      },
      {
        kind: 'do',
        text: 'Give TabsList an aria-label on a page with more than one set: Radix names the tablist after nothing, and two unnamed tablists are two “tab list”s a reader cannot tell apart.',
      },
      {
        kind: 'dont',
        text: 'An unselected panel is unmounted, not hidden — find-in-page cannot reach its text, a print takes only the panel that was open, and a half-filled form in another tab has lost what was typed into it by the time the reader comes back.',
      },
      {
        kind: 'dont',
        text: 'The selected tab lives in React state, not in the URL: a reader who reloads or shares the page lands on the first panel, so anything worth linking to needs value lifted into a query parameter.',
      },
      {
        kind: 'dont',
        text: 'Tabs are not a way to fit more in: the strip scrolls silently, and a sixth tab past the fold looks exactly like a page that only has five.',
      },
    ],
    accessibility: [
      'The strip scrolls rather than wrapping: a wrapped second row moves every tab below it and the reader loses the one they were about to click.',
      '44px tall, because a tab is a pointer target like any other.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the strip, and out of it — the whole strip is one stop.' },
      { keys: ['←', '→'], does: 'Moves between tabs and switches the panel with them.' },
      { keys: ['Home', 'End'], does: 'Jumps to the first or last tab.' },
    ],
    related: ['accordion'],
  },
  {
    name: 'Accordion',
    group: 'Navigation',
    summary: 'Disclosure rows that open in place.',
    when: 'The marker is a plus, not a chevron: a plus says “this opens”, a chevron says “there is more below”.',
    anatomy: [
      {
        element: 'Row',
        required: true,
        description:
          'AccordionItem — one hairline-ruled record, keyed by the value Radix opens and closes it by. The set is the root above it: type="single" with collapsible for an FAQ, type="multiple" for a stack of settings.',
      },
      {
        element: 'Heading',
        required: true,
        description:
          'Radix’s Accordion.Header, which is an <h3> and takes no level prop. Every row therefore adds an h3 to the document outline, wherever the accordion happens to sit.',
      },
      {
        element: 'Trigger',
        required: true,
        description:
          'The full-width button inside that heading: title against the start edge, marker against the end, py-4. It is also what names the open panel.',
      },
      {
        element: 'Marker',
        required: true,
        description:
          'A 16px plus, aria-hidden, rotating 45° into a minus when the row opens. The state it draws is carried for everyone else by aria-expanded on the trigger.',
      },
      {
        element: 'Panel',
        description:
          'Radix’s Content — a role="region" labelled by its trigger, mounted only while open, overflow-hidden so its measured height can animate, with pb-4 pe-8 inside so the text stops short of the marker’s column.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass collapsible alongside type="single": without it there is no empty value to return to, so the first row the reader opens is a row they can never close again.',
      },
      {
        kind: 'do',
        text: 'Key each item by something stable rather than by its position — Radix tracks the open row by value, so re-ordering or filtering the list leaves whatever now sits in that slot standing open.',
      },
      {
        kind: 'do',
        text: 'Write the title as the whole question: it is the accessible name of the panel as well as of the trigger, so a row titled “More” opens a region called “More”.',
      },
      {
        kind: 'do',
        text: 'Reach for type="multiple" when two rows have to be read against each other — single closes the one the reader was holding in order to open the one they wanted to compare it with.',
      },
      {
        kind: 'dont',
        text: 'A closed row’s content is not in the DOM, so an FAQ built out of these is invisible to find-in-page and prints as a list of questions — anything that has to be searchable or printable belongs in the page.',
      },
      {
        kind: 'dont',
        text: 'The trigger is fixed at h3 by Radix’s header, so an accordion under an <h3> lists its rows as that heading’s siblings and the outline goes flat exactly where it should have nested.',
      },
      {
        kind: 'dont',
        text: 'The panel is overflow-hidden — that is what lets the open height animate — so anything inside that must escape the row’s box has to portal out of it; a menu that renders in place is cut off at the row’s edge.',
      },
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Moves between rows.' },
      { keys: ['Enter', 'Space'], does: 'Opens or closes the focused row.' },
    ],
    related: ['tabs'],
  },
  {
    name: 'Breadcrumb',
    group: 'Navigation',
    summary: 'Where you are, as a path.',
    anatomy: [
      {
        element: 'Trail',
        required: true,
        description:
          'A <nav> named by label, which defaults to “Breadcrumb”. It is a landmark whether or not the page wanted another one, set in mono-meta at --ink-3-aa.',
      },
      {
        element: 'List',
        required: true,
        description:
          'An <ol> — the order is the hierarchy, not the reader’s history. It wraps rather than truncating, so a deep path takes a second line instead of losing a level.',
      },
      {
        element: 'Crumb link',
        description:
          'An <a> for every item that has an href and is not the last. The label is a ReactNode, so whatever you put in it becomes part of the link’s accessible name.',
      },
      {
        element: 'Current crumb',
        required: true,
        description:
          'The last item, always: plain text at full --ink with aria-current="page", whether or not it was given an href.',
      },
      {
        element: 'Separator',
        description:
          'A slash by default, in its own <li aria-hidden> between crumbs. Decorative by construction — it is never part of what is read out.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass label when a page can hold two trails: both nav landmarks are named “Breadcrumb” otherwise, and two landmarks with one name are two entries a reader cannot choose between.',
      },
      {
        kind: 'do',
        text: 'Give every crumb but the last an href — one without renders as plain text in the same colour as the links beside it, with no destination and no aria-current, so it reads as the page the reader is on when it is not.',
      },
      {
        kind: 'do',
        text: 'Start the trail above the current page: a one-item Breadcrumb renders that item as the current crumb with no path at all, which is a landmark announcing a journey of length one.',
      },
      {
        kind: 'dont',
        text: 'Leave the href off the last item rather than passing one it ignores: the last crumb is text whatever you hand it, so an href there reads as a link in review and is not one at run time.',
      },
      {
        kind: 'dont',
        text: 'Do not hide it on a phone to save a line. That is the layout where the sidebar is behind a drawer, which makes the trail the only way up a level that is on the screen.',
      },
    ],
    accessibility: [
      'The last crumb is text with aria-current="page", never a link to itself.',
      'Separators are aria-hidden, so the trail is not read as “home slash work slash”.',
    ],
    related: ['pagination'],
  },
  {
    name: 'Pagination',
    group: 'Navigation',
    summary: 'Numbered pages, with the middle elided.',
    anatomy: [
      {
        element: 'Nav',
        required: true,
        description:
          'A <nav> named by label, “Pagination” by default. Nothing else here is a landmark, so this is how a reader jumps to the pager rather than scrolling to it.',
      },
      {
        element: 'Step buttons',
        required: true,
        description:
          'Previous and Next, pill-cornered at --control-h-sm, named “Previous page” and “Next page”. Each is disabled at its end of the range, which takes it out of the tab order rather than leaving a control that does nothing.',
      },
      {
        element: 'Page list',
        required: true,
        description:
          'An <ol> of numbers, each a <button> named “Page N” and carrying aria-current on the one you are on.',
      },
      {
        element: 'Travelling pill',
        description:
          'One aria-hidden fill, measured from the selected button and moved with a transform rather than two grounds cross-fading. It is absent until the first measurement lands, and holds still under prefers-reduced-motion.',
      },
      {
        element: 'Ellipsis',
        description:
          'An aria-hidden <li> wherever the sequence skips more than one page. A single skipped page is printed instead — “1 … 3” is longer than “1 2 3” and says less.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Move page in the same state update that fetches: it is fully controlled, so a handler that loads the next page without setting page leaves the pager marking the page the reader just left.',
      },
      {
        kind: 'do',
        text: 'Raise siblings rather than lowering it — below 2 × siblings + 5 pages every page is printed anyway, so the prop does nothing on a short list and is the only lever you have on a long one.',
      },
      {
        kind: 'do',
        text: 'Import paginationRange when something else has to agree with the pager: it is exported and pure, which is how a server-rendered summary and this component end up describing one window instead of two.',
      },
      {
        kind: 'do',
        text: 'Let the surrounding row collapse: the component returns null at one page or fewer, so a footer built to a fixed height shows an empty strip on the day the list gets short.',
      },
      {
        kind: 'dont',
        text: 'Do not put it in a compact region and call it a touch target: the pills are --control-h-sm, 36px comfortable and 30px under data-density="compact", set 4px apart — well under the 44px WCAG 2.5.5 asks of a pointer target.',
      },
      {
        kind: 'dont',
        text: 'Do not expect it to translate: “Page 3”, “Previous page” and “Next page” are the controls’ accessible names and all three are hardcoded English — label names the nav and is the only string a call site can change.',
      },
    ],
    accessibility: [
      'The current page is a button with aria-current, not a styled span — a reader jumping by control needs to find it.',
      'Renders nothing at one page. A pager for a single page is furniture.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Reaches every control, including the current page.' },
      { keys: ['Enter', 'Space'], does: 'Goes to that page.' },
    ],
    related: ['breadcrumb'],
  },
  {
    name: 'NavItem',
    group: 'Navigation',
    summary: 'A row in a sidebar.',
    anatomy: [
      {
        element: 'Row',
        required: true,
        description:
          'An <a href> at --control-h-sm with the --radius corner — or, under asChild, the router link you handed it, which receives the classes and aria-current and becomes the row itself.',
      },
      {
        element: 'Icon',
        description:
          'An optional lucide component at 18px, aria-hidden, ahead of the label. It is rendered by the native branch only: a slotted row takes its icon inside the child, because Slot accepts exactly one.',
      },
      {
        element: 'Label',
        required: true,
        description:
          'children, and the row’s whole accessible name — the icon contributes nothing to it.',
      },
      {
        element: 'Active ground',
        description:
          'What active turns on, in one move: a --stone fill, medium weight, and aria-current="page". Three signals, so the current row survives monochrome and low contrast.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Repeat href on the slotted child: asChild forwards the classes and aria-current and nothing else, so a <Link> that does not carry its own href is a row that navigates nowhere.',
      },
      {
        kind: 'do',
        text: 'Put the icon inside the child in asChild mode — the icon prop is silently dropped there, which is how a whole sidebar renders as a column of unlabelled-looking rows.',
      },
      {
        kind: 'do',
        text: 'Derive active from the router’s current path rather than from the last click: it is what writes aria-current="page", so a sidebar tracking its own clicks tells a reader they are on the row they pressed instead of the page they are on.',
      },
      {
        kind: 'dont',
        text: 'Do not mark a parent row active to show which section contains the page: active means aria-current="page", and two of them is a reader told they are in two places at once.',
      },
      {
        kind: 'dont',
        text: 'Do not tighten the row further: it is --control-h-sm, which is 36px comfortable and 30px under data-density="compact", and a py class below that leaves a column of targets a thumb has to aim at.',
      },
    ],
    accessibility: [
      'aria-current="page" and not only a colour: the active row is also carried by weight and a filled ground.',
    ],
    related: ['app-shell'],
  },
  {
    name: 'Collapsible',
    group: 'Navigation',
    summary: 'One thing that opens, on its own.',
    when: 'The difference from Accordion is arithmetic: an accordion is a SET and can coordinate. An accordion of one manages a value nobody reads.',
    anatomy: [
      {
        element: 'Root',
        required: true,
        description:
          'Collapsible — Radix’s root, holding open or defaultOpen and drawing nothing. CollapsibleSection is the same root with the trigger and panel already composed, and is what most call sites want.',
      },
      {
        element: 'Trigger',
        required: true,
        description:
          'A plain <button> carrying aria-expanded and aria-controls — and, unlike an accordion row, wrapped in no heading at all. Nothing here appears in a document outline.',
      },
      {
        element: 'Marker',
        required: true,
        description:
          'A chevron rotating 180°, chosen against the accordion’s plus on purpose: this reveals more of the same thing, where an accordion row opens a distinct answer.',
      },
      {
        element: 'Panel',
        description:
          'Radix’s Content, unmounted while closed and animating on the measured --radix-collapsible-content-height, so a long group and a short one take the same time. A bare div: no region role and no name of its own, again unlike an accordion’s.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Give the trigger a heading of your own when the section is a section: Accordion wraps every trigger in an <h3> and this deliberately wraps none, so a page built from CollapsibleSections has nothing for heading navigation to stop at.',
      },
      {
        kind: 'do',
        text: 'Reach for the loose CollapsibleTrigger and CollapsibleContent only when the header has to hold more than a title — a count on one side, a switch on the other. They exist so that call site does not go to Radix and re-derive aria-expanded by hand.',
      },
      {
        kind: 'do',
        text: 'Set defaultOpen when what it hides is why the reader came: the closed panel is unmounted rather than hidden, so its text is not in the page for find-in-page, for a print, or for anything reading the rendered DOM.',
      },
      {
        kind: 'do',
        text: 'Control it with open and onOpenChange when something outside has to open it — a sidebar group that must expand for the route living inside it cannot be told to from a component that owns its own state.',
      },
      {
        kind: 'dont',
        text: 'Do not build a set out of these: two sections cannot close each other, so the reader ends with every one open and a column to scroll past. That coordination is the whole of what Accordion’s single value buys.',
      },
      {
        kind: 'dont',
        text: 'Do not flip the title between “Show more” and “Show less”: aria-expanded on the trigger already carries the state, so the row is announced with its state twice and with a new name each time it is pressed.',
      },
    ],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens or closes it.' },
    ],
    related: ['accordion'],
  },
]
