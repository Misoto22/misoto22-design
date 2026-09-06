import catalog from '@/generated/catalog'

/**
 * The component list, and where each one sits in the sidebar.
 *
 * What each component IS — its group, its one-line summary, when to reach for
 * it instead of its neighbour, the promises it keeps and its keyboard contract
 * — is authored in the PACKAGE, at `packages/design/agent/catalog.mjs`, and
 * read here from the artifact its build emits. That is the same arrangement the
 * tokens already have, and for the same reason: it describes the components, so
 * a hand-kept copy on this side would be a second answer to a question the
 * package already answers — and this side is the one people would read.
 *
 * What is genuinely the site's own is below: how tall a preview card has to be
 * before an open panel spills out of it. Nothing else.
 *
 * `dir` and `slug` are both the component's name — the directory under
 * `packages/design/src/components`, and the name in kebab-case. Neither is
 * authored; `catalog.test.ts` in the package fails if either stops being true.
 */

export const GROUPS = catalog.groups as readonly string[] as readonly ComponentGroup[]

export type ComponentGroup =
  | 'Actions'
  | 'Display'
  | 'Feedback'
  | 'Forms'
  | 'Overlays'
  | 'Navigation'
  | 'Surfaces'

export interface ComponentEntry {
  /** URL segment — the name in kebab-case. */
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
   * vocabulary as the rest of them. The site's own, which is why it is the one
   * thing this file still authors.
   */
  previewHeight?: string
  /** Slugs of components a reader is likely to want next. */
  related?: string[]
}

/** How much room each open-panel preview reserves. The site's only opinion here. */
const PREVIEW_HEIGHTS: Record<string, string> = {
  calendar: 'min-h-[24rem]',
  combobox: 'min-h-[29rem]',
  command: 'min-h-[24rem]',
  'context-menu': 'min-h-[20rem]',
  'date-picker': 'min-h-[26rem]',
  'dropdown-menu': 'min-h-[18rem]',
  popover: 'min-h-[20rem]',
  'searchable-menu': 'min-h-[27rem]',
  select: 'min-h-[24rem]',
}

export const COMPONENTS: ComponentEntry[] = catalog.components.map((entry) => ({
  ...(entry as Omit<ComponentEntry, 'dir' | 'previewHeight'>),
  dir: entry.name,
  previewHeight: PREVIEW_HEIGHTS[entry.slug],
}))

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
