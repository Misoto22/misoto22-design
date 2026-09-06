/**
 * The templates, and what each one is for.
 *
 * A gallery answers "what does a Table look like". A template answers the
 * question after it — which components a real screen needs TOGETHER, and how
 * they space against each other once there are twelve of them rather than one.
 *
 * There are two lines here, and they are not the same exercise.
 *
 * The first four are a DENSITY TEST, and that is all they were ever meant to
 * be. A console is many components, close together, in a bounded column; a
 * landing page is very few, with a great deal of space and type doing most of
 * the work; a blog index is neither, and is a list of records that differ in
 * length; an article is the reading surface, against markup nobody here
 * authored. A system that only looks right at one of those has one screen in
 * it. They are not paste-ready pages and should not be read as any.
 *
 * The eight after them are the opposite purpose: the SCREENS PEOPLE ACTUALLY
 * SHIP. Settings, sign-in, a data table, a wizard, a record, the three states,
 * a documentation page, a pricing page. Each one is still assembled only from
 * the package — nothing is styled specially for a template, which is the only
 * arrangement where it stays honest as the system changes — but the question it
 * answers is "what does this screen look like when it is built out of this
 * system", not "where does the spacing ramp break".
 *
 * Both lines earn their place the same way: each entry's `tests` names a
 * failure mode no other entry would have caught.
 */

/**
 * The groups the index filters by.
 *
 * Ordered as the strip reads, not alphabetically: the application screens
 * first, the two editorial ones after them, and `Patterns` last because it is
 * the only entry that is not a screen at all.
 */
export const TEMPLATE_CATEGORIES = [
  'Console',
  'Data',
  'Forms',
  'Auth',
  'Settings',
  'Content',
  'Marketing',
  'Patterns',
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export interface TemplateEntry {
  slug: string
  /** The module under `src/templates`, and the key into the generated source. */
  id: string
  name: string
  /** Which group the index files it under. See {@link TEMPLATE_CATEGORIES}. */
  category: TemplateCategory
  summary: string
  /** What this one is testing about the system that the others are not. */
  tests: string
  /** Roughly what it is built from, for the index card. */
  uses: string[]
}

export const TEMPLATES: TemplateEntry[] = [
  {
    slug: 'dashboard',
    id: 'Dashboard',
    name: 'Dashboard',
    category: 'Console',
    summary: 'A console: a sidebar, a figure band, tabs, a filterable table and two job cards.',
    tests: 'Density. Twelve components in a bounded column, close enough together that any spacing decision that was only ever checked in isolation shows up.',
    uses: ['NavItem', 'FigureBand', 'Tabs', 'ToggleGroup', 'Table', 'Badge', 'Progress', 'Select', 'Card', 'StatusPill', 'Avatar', 'Button'],
  },
  {
    slug: 'landing',
    id: 'Landing',
    name: 'Landing page',
    category: 'Marketing',
    summary: 'A marketing page: a hero, a figure band, three pillars, a reversed pricing plate and an FAQ.',
    tests: 'Air. Very few components, a great deal of space, and the type ladder carrying the page — the opposite failure mode to the console.',
    uses: ['StatusPill', 'Button', 'Tag', 'FigureBand', 'Card', 'Separator', 'Field', 'Input', 'Accordion', 'Badge', 'LinkArrow'],
  },
  {
    slug: 'blog',
    id: 'Blog',
    name: 'Blog index',
    category: 'Content',
    summary: 'A publication index: a filter strip, a lead story, and a ruled list of records.',
    tests:
      'Uneven records. A card grid hides them behind equal boxes; a ruled list does not, so a summary that runs three lines on one row and one on the next shows immediately.',
    uses: ['ToggleGroup', 'Input', 'Badge', 'Tag', 'Avatar', 'LinkArrow', 'Pagination', 'Separator', 'StatusPill', 'Button'],
  },
  {
    slug: 'post',
    id: 'Post',
    name: 'Article',
    category: 'Content',
    summary: 'One post, rendered from a real Markdown file through the site’s own pipeline.',
    tests:
      'The reading surface, against markup nobody in this repository authored: headings, tables, footnotes, LaTeX as MathML, task lists, fenced code, a flow diagram and a numbered pipeline, all out of one .md file.',
    uses: ['Article', 'Diagram', 'Steps', 'Avatar', 'Badge', 'Tag', 'Separator', 'Button'],
  },
  {
    slug: 'settings',
    id: 'Settings',
    name: 'Settings',
    category: 'Settings',
    summary:
      'A workspace settings screen: a section rail, four groups of real controls, and a save bar that only exists once something changed.',
    tests:
      'Form density down a long page. A checkbox row, a switch row and a radio row were each spaced correctly on their own and then stacked, at which point they stop agreeing about what a row is — and the save bar has to pin itself over the last of them without covering it.',
    uses: ['NavItem', 'Field', 'Input', 'Textarea', 'Select', 'Switch', 'Checkbox', 'RadioGroup', 'Alert', 'Separator', 'Avatar', 'Badge', 'Button'],
  },
  {
    slug: 'login-card',
    id: 'LoginCard',
    name: 'Sign in',
    category: 'Auth',
    summary:
      'A centred authentication card: email and password, a rejected attempt still on screen, and a divider into two SSO buttons.',
    tests:
      'The failed state, which is the state a sign-in screen is actually judged on. Drawn only in its happy path, a card has nowhere to put a rejection that has to reach the form, the field and the screen reader at the same time.',
    uses: ['Card', 'Field', 'Input', 'Alert', 'Checkbox', 'Button', 'Separator', 'StatusPill', 'LinkArrow'],
  },
  {
    slug: 'table-filter',
    id: 'TableFilter',
    name: 'Data table',
    category: 'Data',
    summary:
      'A table with everything a real one has: a filter strip, a sorted column, row selection with a bulk bar, and pagination.',
    tests:
      'A table under its own controls. Sorting, selecting and filtering each look right alone; together they compete for the header row, the bulk bar has to appear without shifting the rows beneath it, and filtering to nothing has to land somewhere other than a blank rectangle.',
    uses: ['Table', 'TH', 'Checkbox', 'Input', 'Select', 'ToggleGroup', 'DropdownMenu', 'Pagination', 'EmptyState', 'StatusDot', 'Badge', 'Button'],
  },
  {
    slug: 'form-wizard',
    id: 'FormWizard',
    name: 'Multi-step form',
    category: 'Forms',
    summary:
      'Four steps to create a deploy environment: the rail on one side, the current step’s fields beside it, and a review that reads back what was entered.',
    tests:
      'A sequence rather than a page. Steps is a display rail and enforces nothing — it cannot know which fields belong to the marked step — so this is where the seam between "what the rail says" and "what the form shows" is either kept in one place or quietly duplicated in two.',
    uses: ['Steps', 'Field', 'Input', 'Textarea', 'Select', 'RadioGroup', 'Switch', 'Alert', 'Table', 'Separator', 'Badge', 'Button'],
  },
  {
    slug: 'detail-page',
    id: 'DetailPage',
    name: 'Record detail',
    category: 'Data',
    summary:
      'One incident: a title block carrying its status, the write-up, a metadata rail, and the activity that happened to it.',
    tests:
      'Two columns that are not equals. The body is prose on the measure and the rail is a dozen short facts, so a definition list and a paragraph have to hold the same vertical rhythm without either one setting the other’s — the failure the console never sees, because everything in it is the same shape.',
    uses: ['Breadcrumb', 'StatusPill', 'Badge', 'DropdownMenu', 'Avatar', 'Tag', 'Alert', 'Separator', 'LinkArrow', 'Button'],
  },
  {
    slug: 'states',
    id: 'States',
    name: 'Loading, empty, error',
    category: 'Patterns',
    summary:
      'The three states every real screen has, drawn side by side: a skeleton, an empty collection, and a page that failed.',
    tests:
      'The states nobody screenshots. Each is built once, shipped, and never seen beside the other two again — which is how a skeleton ends up a different shape from the thing it stands in for, and an error page ends up reading like an empty folder.',
    uses: ['SkeletonPage', 'SkeletonBlock', 'SkeletonLine', 'SkeletonText', 'EmptyState', 'ErrorState', 'Alert', 'Separator', 'Badge', 'Button'],
  },
  {
    slug: 'docs-shell',
    id: 'DocsShell',
    name: 'Documentation',
    category: 'Content',
    summary:
      'A reference page: a sidebar of sections, an article column with a props table and a keyboard note, and a contents rail beside it.',
    tests:
      'Three columns at once. A sidebar and a contents rail leave the middle narrower than any other template’s, which is the width at which a table, a long code identifier and a callout stop fitting and have to decide which of them scrolls.',
    uses: ['NavItem', 'Breadcrumb', 'Table', 'Kbd', 'Alert', 'Steps', 'Tag', 'Badge', 'Separator', 'LinkArrow', 'Button'],
  },
  {
    slug: 'pricing',
    id: 'Pricing',
    name: 'Pricing',
    category: 'Marketing',
    summary:
      'Three plans behind a monthly/annual switch, a feature comparison table, and the questions people ask before paying.',
    tests:
      'One card that has to win without colour. There is a single accent and no gradient in this system, so "recommended" is carried by the plate variant, a rule weight and where the badge sits — and if that reads as a mistake rather than as emphasis, the depth ramp is wrong.',
    uses: ['Card', 'CardTitle', 'ToggleGroup', 'Table', 'Accordion', 'StatusPill', 'Badge', 'Tag', 'Separator', 'LinkArrow', 'Button'],
  },
]

export const TEMPLATE_BY_SLUG = new Map(TEMPLATES.map((entry) => [entry.slug, entry]))
