# The documentation site

`apps/docs` is a Next.js app exported statically to Cloudflare Pages. Almost
everything it says about the package is read out of the package, so the two
cannot disagree.

## What is generated, and from what

| Output | Read from | Why not hand-written |
|---|---|---|
| `props.json` | the components' TypeScript AST | a hand-kept prop table is how a docs site starts lying — someone adds a prop and the table still lists four |
| `tokens.json` | `@misoto22/design/tokens` | the package emits it; the site parsing the CSS a second time meant the two could disagree, and the site is the one people believe |
| `examples.json` | `src/examples/**/*.tsx` | the page renders the module and the code block is read from the same file, so a preview cannot drift from the code beneath it |
| `templates.json` | `src/templates/*.tsx` | same trick, for whole screens |
| `changelog.json` | the repository's `CHANGELOG.md` | two lists of what changed disagree within two releases |

What each component IS — its group, summary, anatomy, best practices,
accessibility promises and keyboard contract — is authored in the PACKAGE, at
`packages/design/agent/catalog/*.mjs`, and read here from the artifact its build
emits. `src/content/registry.ts` adds only what is genuinely the site's own, and
`registry.test.ts` fails the build when it falls out of step with what the
package ships. The site's own prose — the foundations pages, the templates, the
eight laws — is hand-written under `src/content/`.

## Locales

- English: no prefix — `/components/button/`
- Chinese: `/zh/components/button/`

`src/views/*` holds each page's body and takes a `locale`; `src/app/**` and
`src/app/zh/**` are thin route files that pass it. Client components read the
locale off the pathname instead, because threading a prop through the chrome to
reach a search box is worse than one hook.

### Nothing ships in one language by accident

Every translatable string is covered by one of three mechanisms, and each fails
at a different moment on purpose. The rule they exist to enforce is that adding
English is not a thing you can finish without deciding, in writing, what happens
to the Chinese.

| Where the English lives | Mechanism | What fails, and when |
|---|---|---|
| The site's own chrome — nav, headings, labels | `src/i18n/messages.ts` types `zh` off `en` | `tsc`, on a missing key |
| The package catalog, the example files, the foundations/templates/laws prose | `src/i18n/zh.ts` is `Record<RequiredKey, Translation>` | `tsc`, naming the key, the moment the catalog grows |
| The API reference | `src/i18n/api.ts`, keyed and fingerprinted | `api.test.ts` |
| A sentence typed straight into JSX | `untranslated-chrome.test.ts` scans the render layer | vitest, naming the file and the sentence |

`scripts/generate.mjs` emits `src/generated/i18n-keys.ts` — a union of every
English string the catalog, the examples and the site's own content hand the
pages, 2784 of them — and `i18n-source.json`, which carries each string with a
fingerprint of itself. `zh.ts` is total over that union minus the deferrals, so
an untranslated string is a **compile error naming the key**, not a page that
quietly renders in English.

Each translation stores the fingerprint of the English it was made from, so
rewording a summary in the package fails `translation-gate.test.ts` until
somebody looks at the Chinese. That is the failure the whole arrangement is
built around: not a blank page, but a Chinese sentence still confidently stating
what the English used to say.

`src/i18n/deferred.ts` is the escape valve, and using it costs a visible edit —
a pattern, an owner, a date, and a real reason. The list only shrinks: a
deferral that stops matching anything fails the gate, so translating a page
forces the excuse to be deleted in the same commit.

```bash
# what is still English, and why
sed -n '/^export const DEFERRED/,/^]/p' apps/docs/src/i18n/deferred.ts
```

Anything without a translation falls back to English rather than rendering
blank, field by field — so a half-finished page is shippable instead of
something to hold back.

## Testing

| Suite | Runs in | Answers |
|---|---|---|
| `src/content/__tests__` | vitest | does the registry match what the package ships |
| `src/i18n/__tests__/translation-gate.test.ts` | vitest | is any translation missing, orphaned, stale, or excused by a dead deferral |
| `src/__tests__/untranslated-chrome.test.ts` | vitest | is there English typed into JSX where nothing can translate it |
| `e2e/a11y.spec.ts` | Chromium | axe over **every page, both themes, both languages** |
| `e2e/keyboard.spec.ts` | Chromium | the site's own shortcuts, the editor, the search |
| `e2e/interactions.spec.ts` | Chromium | the component behaviours a static tree cannot show |
| `e2e/direction.spec.ts` | Chromium | RTL actually mirrors; density actually shrinks |
| `e2e/shell.spec.ts` | Chromium | the palette, the accent, the templates |
| `e2e/i18n.spec.ts` | Chromium | both locales, and that the switcher stays on the page |

```bash
pnpm dev                                       # localhost:4023
pnpm --filter @misoto22/design-docs test:e2e   # needs `pnpm build` first
```

The end-to-end suite serves the **built export**, not the dev server — the dev
server renders through a different pipeline, so a bug in the artifact would pass
and then reach production.
