---
'@misoto22/design': minor
---

The package tells an agent when it gets a component wrong, and reaches agents
that are not Claude Code.

Six gaps, found by re-reading what the ecosystem settled on since the agent
surface shipped.

**Development warnings, written to be repaired from.** The skill documented a
handful of ways to misuse a component that fail *silently*, and documentation
only helps a reader who went looking — the whole problem being that nothing told
them to look. Now the component says it where it happens, in the shape an agent
can act on without asking: a stable code, the offending field, and an imperative
fix.

- `FIELD_CONTROL_NOT_LABELLABLE` — `<Field><div><Input /></div></Field>` renders,
  and the label points at the div. This is the failure that looks most correct.
- `FIELD_CONTROL_NOT_WIRED` — no single element to wire at all.
- `BUTTON_ICON_ONLY_UNNAMED` — an `iconOnly` Button with neither `aria-label`
  nor `aria-labelledby` is announced as "button" and nothing else.
- `REQUIRED_NAME_BLANK` — `<Table caption="">` satisfies the type and leaves the
  table anonymous. Applied to `Table.caption`, `Progress.label`, `Select.label`,
  `Combobox.label` and `FloatingIconButton.label`; deliberately not to
  `Avatar.alt`, where an empty string is the correct markup for a decorative
  image.

Each fires once per problem, and every call site is behind
`process.env.NODE_ENV`, so none of it reaches a production bundle.

**`init` reaches more than one agent.** It wrote only `.claude/skills/`, which
handed Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, Zed and Warp
nothing. It now writes `.agents/skills/` — the path all of those share — and
adds `.claude/skills/` when the project already has one. `--agent agents` or
`--agent claude` picks one.

**Pointer files at the package root.** `AGENTS.md`, `CLAUDE.md` and `llms.txt`
now ship in the tarball. An agent exploring `node_modules` looks for those
filenames before it opens a README or reaches the network, and found none of
them. They are pointers only, so they cannot go stale between releases. The
`AGENTS.md` doubles as the nested subproject file for anyone working on the
package in its own repository.

**Prompt-based evals.** `skills/misoto22-design/evals/evals.json` carries six
tasks with the identifiers correct output must and must not contain. `claims.json`
proves the rules match the package; it cannot prove an agent given the rules
writes correct code, and this is the half that can. Every `must_use` identifier
is checked against the real export surface, so an eval cannot quietly start
expecting something the package no longer ships.

Also documented: `npx skills add Misoto22/misoto22-design` already works and
nothing said so.
