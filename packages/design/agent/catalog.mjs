/**
 * What each component IS — the half a parser cannot produce.
 *
 * Everything mechanical (props, types, defaults, JSDoc) is read out of
 * `src/components/**` by `scripts/extract-props.mjs`. What is left here is the
 * part someone has to decide: which group a component belongs to, its one-line
 * summary, when to reach for it instead of its neighbour, the promises it keeps
 * so a call site does not have to, and its keyboard contract key by key.
 *
 * This lives in the PACKAGE rather than in the documentation site because it
 * describes the components, not the site. It is also what makes the package
 * legible offline: `scripts/emit-agent.mjs` turns it plus the extracted props
 * into `dist/agent/`, which is what `npx misoto22-design docs <Component>`
 * prints and what the skill in `skills/` sends an agent to.
 *
 * The site reads the emitted `dist/agent/catalog.json`, the same way it already
 * reads `dist/tokens.json` rather than re-parsing the stylesheets. A second
 * hand-kept copy is a copy that goes stale, and the site would have been the
 * one people believed.
 *
 * `name` is the only identifier. The directory under `src/components` is the
 * name, and the site's URL slug is the name in kebab-case; `catalog.test.ts`
 * fails if either stops being true, so neither is authored twice.
 *
 * The entries themselves live one group to a file under `catalog/`, and this
 * module concatenates them in `GROUPS` order. They are prose rather than rows —
 * several paragraphs per component once anatomy and practices are filled — and a
 * single list of fifty-two of them is a file only one hand can be writing at a
 * time. Nothing else moved: this is still the module every consumer imports, and
 * `catalog.test.ts` fails if the concatenation loses an entry, duplicates a name,
 * or lets one group’s entries drift into another’s.
 */

import { ACTIONS } from './catalog/actions.mjs'
import { DISPLAY } from './catalog/display.mjs'
import { FEEDBACK } from './catalog/feedback.mjs'
import { FORMS } from './catalog/forms.mjs'
import { OVERLAYS } from './catalog/overlays.mjs'
import { NAVIGATION } from './catalog/navigation.mjs'
import { SURFACES } from './catalog/surfaces.mjs'

/**
 * @typedef {object} KeyRow
 * @property {string[]} keys
 * @property {string} does
 */

/**
 * A part of the rendered thing, named so a reader can point at it.
 *
 * The props tell a reader what to pass; they do not tell it what it will be
 * looking at, and half the questions asked about a component are about a part
 * that has no prop of its own — a spinner that only exists while `loading` is
 * true, a slot the label shares with an icon.
 *
 * @typedef {object} AnatomyPart
 * @property {string} element The name of the part, as a reader would point at it.
 * @property {boolean} [required] Whether the part is always present.
 * @property {string} description What the part is for.
 */

/**
 * One judgement about using the component, and the consequence of ignoring it.
 *
 * `accessibility` records what the component does on the caller's behalf. This
 * records what it cannot do: the call sites that compile, render, and are still
 * wrong. A line here earns its place by naming what breaks, because advice
 * without a consequence is a preference, and a preference is skipped.
 *
 * @typedef {object} Practice
 * @property {'do' | 'dont'} kind
 * @property {string} text One judgement, stated as one sentence.
 */

/**
 * @typedef {object} CatalogEntry
 * @property {string} name Display name, the directory name, and the slug source.
 * @property {string} group One of `GROUPS`.
 * @property {string} summary One line.
 * @property {string} [when] When to reach for this rather than the one beside it.
 * @property {AnatomyPart[]} [anatomy] The parts a reader can point at, named.
 * @property {Practice[]} [practices] Do and don't, as judgements rather than advice.
 * @property {string[]} [accessibility] Promises the component keeps.
 * @property {KeyRow[]} [keyboard] The keyboard contract, key by key.
 * @property {string[]} [related] Slugs a reader is likely to want next.
 */

export const GROUPS = ['Actions', 'Display', 'Feedback', 'Forms', 'Overlays', 'Navigation', 'Surfaces']

/** Every component's slug is its name in kebab-case. Derived, never authored. */
export const slugOf = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/**
 * Every entry, in `GROUPS` order — see the group files under `catalog/`.
 *
 * @type {CatalogEntry[]}
 */
export const CATALOG = [...ACTIONS, ...DISPLAY, ...FEEDBACK, ...FORMS, ...OVERLAYS, ...NAVIGATION, ...SURFACES]

/**
 * What each theme axis MEANS. The axes and their values are not authored here —
 * `scripts/emit-agent.mjs` reads them out of the stylesheets, the same way the
 * token list is read rather than retyped, and `catalog.test.ts` fails when this
 * table and the stylesheets disagree.
 *
 * What IS authored is the half a selector cannot say: what an unset axis gives
 * you. Every axis has an unset default — the White Reset is what you get by
 * writing no attribute at all — and a reader who does not know that reads the
 * value list as exhaustive and sets one needlessly.
 *
 * `data-accent` is deliberately absent, and was the reason this became derived
 * rather than authored: the site's llms.txt described one for months. There is
 * no such attribute. `--accent` is a custom property, re-pointed in CSS.
 *
 * @type {Record<string, string>}
 */
export const AXIS_DEFAULTS = {
  'data-mode': 'follows the app',
  'data-surface': 'paper',
  'data-radius': 'the default radius ladder',
  'data-rules': 'hairline',
  'data-type': 'editorial',
  'data-motion': 'calm',
  'data-density': 'comfortable',
}
