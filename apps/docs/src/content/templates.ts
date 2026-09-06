/**
 * The templates, and what each one is for.
 *
 * A gallery answers "what does a Table look like". A template answers the
 * question after it — which components a real screen needs TOGETHER, and how
 * they space against each other once there are twelve of them rather than one.
 *
 * The two here are deliberately opposite densities. A console is many
 * components, close together, in a bounded column; a landing page is very few,
 * with a great deal of space and type doing most of the work. A system that
 * only looks right at one of those has one screen in it.
 */
export interface TemplateEntry {
  slug: string
  /** The module under `src/templates`, and the key into the generated source. */
  id: string
  name: string
  summary: string
  /** What this one is testing about the system that the other is not. */
  tests: string
  /** Roughly what it is built from, for the index card. */
  uses: string[]
}

export const TEMPLATES: TemplateEntry[] = [
  {
    slug: 'dashboard',
    id: 'Dashboard',
    name: 'Dashboard',
    summary: 'A console: a sidebar, a figure band, tabs, a filterable table and two job cards.',
    tests: 'Density. Twelve components in a bounded column, close enough together that any spacing decision that was only ever checked in isolation shows up.',
    uses: ['NavItem', 'FigureBand', 'Tabs', 'ToggleGroup', 'Table', 'Badge', 'Progress', 'Select', 'Card', 'StatusPill', 'Avatar', 'Button'],
  },
  {
    slug: 'landing',
    id: 'Landing',
    name: 'Landing page',
    summary: 'A marketing page: a hero, a figure band, three pillars, a reversed pricing plate and an FAQ.',
    tests: 'Air. Very few components, a great deal of space, and the type ladder carrying the page — the opposite failure mode to the console.',
    uses: ['StatusPill', 'Button', 'Tag', 'FigureBand', 'Card', 'Separator', 'Field', 'Input', 'Accordion', 'Badge', 'LinkArrow'],
  },
  {
    slug: 'blog',
    id: 'Blog',
    name: 'Blog index',
    summary: 'A publication index: a filter strip, a lead story, and a ruled list of records.',
    tests:
      'Uneven records. A card grid hides them behind equal boxes; a ruled list does not, so a summary that runs three lines on one row and one on the next shows immediately.',
    uses: ['ToggleGroup', 'Input', 'Badge', 'Tag', 'Avatar', 'LinkArrow', 'Pagination', 'Separator', 'StatusPill', 'Button'],
  },
  {
    slug: 'post',
    id: 'Post',
    name: 'Article',
    summary: 'One post, rendered from a real Markdown file through the site’s own pipeline.',
    tests:
      'The reading surface, against markup nobody in this repository authored: headings, tables, footnotes, LaTeX as MathML, task lists, fenced code, a flow diagram and a numbered pipeline, all out of one .md file.',
    uses: ['Article', 'Diagram', 'Steps', 'Avatar', 'Badge', 'Tag', 'Separator', 'Button'],
  },
]

export const TEMPLATE_BY_SLUG = new Map(TEMPLATES.map((entry) => [entry.slug, entry]))
