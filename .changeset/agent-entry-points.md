---
'@misoto22/design': patch
---

Fix the `Import:` line the offline documentation prints for a chart.

`dist/agent/AreaChart.md` said `import { AreaChart } from '@misoto22/design'`,
which throws. Charts ship from `@misoto22/design/charts` behind optional peers,
and that separation is the whole reason an app rendering a Badge never resolves
`recharts` — so the root barrel does not export them and never will. Twenty
components carried the wrong line, in the tarball and in the site's `llms.txt`
alike. It is the one line an agent pastes without checking.

Which specifier a component is imported from is now derived from the tree its
directory sits in — `ENTRY_POINTS` maps each specifier to one directory under
`src/`, and nothing is authored per component. The alternative was a field on
every entry, which is a second copy of something the filesystem already says.
`catalog.test.ts` fails when a catalog entry names no entry point's tree.

The skill was stale in the same direction and is corrected with it: it said 52
primitives when there are 72, never mentioned the charts entry or
`@misoto22/design/tokens`, and still offered `data-accent` — an attribute that
has never existed, in the same skill whose own `rules/tokens.md` says so. Two
tests now hold that line: every specifier in `exports` has to appear in
`SKILL.md`, and no skill file may offer `data-accent` as something to set.

Nothing about the runtime changed: same exports, same CSS, same bundle.
