/**
 * Every English string this site prints that came from somewhere else.
 *
 * The site has two kinds of translatable prose and they need two different
 * mechanisms. Prose the site AUTHORS — the foundations pages, the templates,
 * the eight laws — is written in TypeScript, so the English and the Chinese can
 * sit in one literal and the compiler can insist on both; nothing here is
 * involved. What this module covers is the other kind: prose that arrives from
 * the design package's catalog and from the JSDoc block above each example.
 * That English cannot hold its own translation, so the Chinese is a separate
 * table, and a separate table is a table that goes stale.
 *
 * So each string gets a key and a fingerprint. The key is what the translation
 * is filed under; the fingerprint is of the English it was made from, which is
 * what turns "the summary was reworded and the Chinese still says the old
 * thing" from something nobody notices into a failing test.
 *
 * The keys are deliberately shaped like paths — `component.<slug>.<field>` —
 * so the deferral patterns in `src/i18n/deferred.ts` can name a whole field
 * across every component with one line instead of nine hundred.
 */

/**
 * A short, stable fingerprint of an English source string.
 *
 * FNV-1a, and the same function `src/i18n/api-hash.ts` uses on the API
 * reference — duplicated rather than imported because that file is TypeScript
 * inside the app and this one is a build script, and the build must not depend
 * on the app compiling. `i18n-manifest.test.ts` fails if the two disagree.
 */
export function fingerprint(source) {
  let hash = 0x811c9dc5
  const text = source.replace(/\s+/g, ' ').trim()
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/**
 * The catalog's translatable strings, keyed.
 *
 * Everything a reader reads and nothing they do not: `kind` on a practice is
 * `do` or `dont` and drives an icon, `keys` on a keyboard row is `['Enter']`,
 * and `slug`, `entry` and `group` are identifiers. Translating any of those
 * would break the page rather than localise it.
 */
export function catalogStrings(catalog) {
  /** @type {Record<string, string>} */
  const strings = {}
  for (const component of catalog.components) {
    const at = `component.${component.slug}`
    strings[`${at}.name`] = component.name
    strings[`${at}.summary`] = component.summary
    if (component.when) strings[`${at}.when`] = component.when
    component.accessibility?.forEach((line, index) => {
      strings[`${at}.accessibility.${index}`] = line
    })
    component.keyboard?.forEach((row, index) => {
      strings[`${at}.keyboard.${index}`] = row.does
    })
    component.anatomy?.forEach((part, index) => {
      strings[`${at}.anatomy.${index}.element`] = part.element
      strings[`${at}.anatomy.${index}.description`] = part.description
    })
    component.practices?.forEach((practice, index) => {
      strings[`${at}.practices.${index}`] = practice.text
    })
  }
  return strings
}

/**
 * The examples' titles and descriptions, keyed.
 *
 * The title is derived from the filename — `01-variants.tsx` becomes
 * "variants" — which makes it look like an identifier rather than copy. It is
 * copy: it is printed as the heading above the canvas, and on a Chinese page an
 * untranslated one is an English word in a Chinese heading.
 */
export function exampleStrings(examples) {
  /** @type {Record<string, string>} */
  const strings = {}
  for (const [dir, list] of Object.entries(examples)) {
    for (const example of list) {
      strings[`example.${dir}.${example.id}.title`] = example.title
      if (example.description) {
        strings[`example.${dir}.${example.id}.description`] = example.description
      }
    }
  }
  return strings
}

/**
 * The foundations pages, the templates and the eight laws.
 *
 * These three ARE authored on this side, in TypeScript, so the argument for
 * co-locating each translation with its English holds — and was rejected, once
 * measured: it means restructuring thirty thousand characters of prose into
 * `{ en, zh }` pairs, and it would leave the site with two translation
 * mechanisms to learn instead of one. The keys cost a build step that already
 * exists. Node reads the TypeScript directly.
 *
 * A law is keyed by its `n` rather than by its position, because the page cites
 * laws by number and a reordering that renumbered every translation would be a
 * diff nobody could review.
 */
export function siteStrings({ foundations, templates, laws }) {
  /** @type {Record<string, string>} */
  const strings = {}
  for (const page of foundations) {
    const at = `foundation.${page.slug}`
    strings[`${at}.title`] = page.title
    strings[`${at}.summary`] = page.summary
    page.intro?.forEach((paragraph, index) => {
      strings[`${at}.intro.${index}`] = paragraph
    })
    for (const category of page.categories ?? []) {
      strings[`${at}.category.${category.key}.title`] = category.title
      if (category.note) strings[`${at}.category.${category.key}.note`] = category.note
    }
    for (const section of page.sections ?? []) {
      const here = `${at}.section.${section.id}`
      strings[`${here}.title`] = section.title
      section.body?.forEach((paragraph, index) => {
        strings[`${here}.body.${index}`] = paragraph
      })
      section.rows?.forEach((row, index) => {
        strings[`${here}.row.${index}.term`] = row.term
        strings[`${here}.row.${index}.detail`] = row.detail
      })
      // `source` is a shell command. `label` is what the reader is told it does.
      section.commands?.forEach((command, index) => {
        strings[`${here}.command.${index}.label`] = command.label
      })
    }
  }
  for (const entry of templates) {
    const at = `template.${entry.slug}`
    strings[`${at}.name`] = entry.name
    strings[`${at}.summary`] = entry.summary
    strings[`${at}.tests`] = entry.tests
  }
  for (const law of laws) {
    const at = `law.${law.n}`
    strings[`${at}.title`] = law.title
    strings[`${at}.body`] = law.body
    strings[`${at}.rulesOut`] = law.rules_out
  }
  return strings
}

/**
 * The manifest: every key, its English, and the fingerprint of that English.
 *
 * Sorted, because this file is regenerated on every build and an unsorted
 * object would produce a diff shaped by `Object.keys` order rather than by what
 * actually changed.
 */
export function buildManifest({ catalog, examples, foundations, templates, laws }) {
  const strings = {
    ...catalogStrings(catalog),
    ...exampleStrings(examples),
    ...siteStrings({ foundations, templates, laws }),
  }
  /** @type {Record<string, { en: string, hash: string }>} */
  const manifest = {}
  for (const key of Object.keys(strings).sort()) {
    manifest[key] = { en: strings[key], hash: fingerprint(strings[key]) }
  }
  return manifest
}

/**
 * The manifest's keys as a TypeScript union.
 *
 * This is the half that cannot be a test. A union plus `Record<Exclude<…>, …>`
 * makes an untranslated string a COMPILE error, listed by name, at the moment
 * the catalog grows — which is the difference between a mechanism that catches
 * the omission and one that reports it after the fact.
 */
export function keysModule(manifest) {
  const keys = Object.keys(manifest)
  return (
    `/* GENERATED by scripts/generate.mjs — do not edit. */\n\n` +
    `/**\n` +
    ` * Every English string the catalog and the examples hand this site.\n` +
    ` *\n` +
    ` * ${keys.length} of them. See \`src/i18n/deferred.ts\` for which of these the\n` +
    ` * compiler currently insists on, and \`src/i18n/zh.ts\` for the answers.\n` +
    ` */\n` +
    `export type TranslatableKey =\n${keys.map((key) => `  | '${key}'`).join('\n')}\n`
  )
}
