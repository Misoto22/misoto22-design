---
'@misoto22/design': patch
---

Example headings reach the Chinese site.

`generate.mjs` derives them from the filename — `02-fill-variants` becomes
`fill variants` — so they are not prose anyone wrote, are not in `messages.ts`,
and are not JSX for `untranslated-chrome.test.ts` to find. Three mechanisms
guard the site's Chinese and none of them can see a string the BUILD makes. So
the contents rail on `/zh` listed `default`, `brush` and `value labels` under
示例 for as long as the site has existed, and every check passed.

`ExampleCopy` gains a `title`, and `exampleTitle()` reads it. No fingerprint,
for the reason `ComponentCopyZh.name` has none: there is no English author to
drift away from, and renaming the file renames the key, which already fails.

The catalogue is translated a group at a time. Charts and Data are done — 88
headings — and the test guards it two ways: a finished group may not regress,
and the untranslated remainder may only get smaller.
