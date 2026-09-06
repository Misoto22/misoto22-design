---
'@misoto22/design': minor
---

Five content primitives: `Text`, `Heading`, `Code`, `CodeBlock` and `Markdown`.

The package had `Article` — a whole reading column, styled from element
selectors — and nothing between it and raw JSX for a single paragraph or one
heading. The evidence was not theoretical: the documentation site had
hand-rolled a private `CodeBlock` of its own, and a template pass had styled a
raw `<pre>` against the tokens because the package exports no code block. A
design system whose own site has to build a primitive has a gap in the package.

- **`Text`** — the system's paragraph. Four steps of type, three rungs of ink,
  and `as` to change the element without changing the look. The default tone is
  `--ink-2`, not `--ink`: a page whose paragraphs are all full-strength ink has
  spent the top of the ladder on its body copy.
- **`Heading`** — `level` sets the element, `size` sets the look, and they are
  two props because every heading component that takes one number bends either
  the outline or the type to reach the other. `size` defaults from `level`
  through the system's ladder, which SKIPS a step between the first two
  levels — `--fs-lead` over `--fs-heading` is a ratio of 1.14 and reads as an
  accident, where `--fs-title` over `--fs-heading` is 1.86 and reads as a
  hierarchy. Levels five and six are the mono kicker, as they are in
  `article.css`.
- **`Code`** — inline code, as a real `<code>`, sized in `em` so the same token
  is proportionate in body copy and in a table cell.
- **`CodeBlock`** — title, language label, line numbers, banded lines, a
  `maxHeight` whose overflow scrolls inside a focusable, named
  `role="group"`, and a copy button that copies the `code` string rather than
  the rendered markup. The body is a group and not a `region` on purpose: a
  region is a LANDMARK, one of the handful of major sections a reader navigates
  a page by, and a snippet is not one — an article carrying three fenced blocks
  would otherwise put three landmarks called "Code" into that map. The group
  keeps the tab stop and keeps the name; it just stays out of the landmark
  list. Highlighting stays out of the package: pass `html` from a build-time
  Shiki pass, or pass nothing and the block renders the string as text.
  `lineNumbers` and `highlightLines` are typed out of the `html` form, because
  they are a per-line structure and `html` is one opaque string — passing both
  is a compile error rather than a prop that silently renders nothing.
- **`Markdown`** — a Markdown STRING into system-styled nodes. This is the
  headline gap: user-generated content, a model's answer or a README had no
  path into the system at all, because `Article` takes trusted HTML through
  `dangerouslySetInnerHTML` and is documented that way.

No new runtime dependency, and that was the decision worth writing down.
markdown-it is what the documentation site uses, but the site is an app and this
is a library, where the dependency list is part of the contract. Measured with
the same esbuild pass `check:size` runs, markdown-it is 110.7 kB minified
against the 38.9 kB the package had left under its bundle budget. So `Markdown`
parses the subset this system already styles — headings, prose, fences,
blockquotes, nested lists, rules, and inline emphasis, code, links and images —
and takes a `parse` function for everything else. It emits React elements rather
than markup, so there is no `dangerouslySetInnerHTML` in that path at all: no
sanitiser to configure and none to get wrong. A link whose scheme is not
`http`, `https`, `mailto` or `tel` renders as plain text.

`headingLevelStart` shifts a whole document down, so markdown dropped inside an
`<h2>` section starts at `<h3>` instead of opening a second `<h1>`, and every
heading carries a stable id slugged from its own text in any script — exported
as `slugify`, so a table of contents can arrive at the same ids without reading
them back off the DOM.

`Markdown` and `Article` stay separate and are composable: `Markdown` turns a
string into nodes, `Article` is the reading column those nodes sit in, and
either works alone. It renders a fragment rather than a wrapper, which is what
makes the nesting work — `Article`'s rhythm is a direct-child combinator, so any
element between the two would cost every paragraph its spacing.

The whole package bundles to 390.6 kB minified against a 420 kB budget, up
9.5 kB; the compiled stylesheet is 71 kB against 90 kB, up 3.3 kB. Importing one
leaf component is unchanged at 27.3 kB, 7% of the whole.
