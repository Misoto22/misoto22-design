---
'@misoto22/design': patch
---

`{@link}` survives extraction, and the article cascade is documented the way it
actually runs.

Three corrections to what the package publishes about itself. None of them
changes a rendered pixel; all three change what a reader — or an agent reading
`dist/agent/` — is told.

**`{@link}` was being deleted.** The props extractor joined a JSDoc comment's
parts on their `text`, and a `{@link Name}` node's own `text` is empty: the
identifier lives on its `name`. So `See {@link TableBorders}.` shipped as
`See .` — nine descriptions across seven components, each one a sentence
pointing at something that had been removed on the way out. A link now renders
as its bare identifier, which is what a reader greps for and what the row
beside it already prints as the prop's type.

**The article cascade was documented backwards.** `Article`'s note, and the
`Article` catalog entry beside it, said a component's own utility outranks the
article's element selectors. It is the other way round: `article.css` is
imported unlayered while Tailwind's utilities sit in `@layer utilities`, and an
unlayered rule beats a layered one whatever either one's specificity is. That
is not a footnote — it is the mechanism the whole composition rests on, the
reason a `Markdown` paragraph carrying `m-0` gives its margin up to the
article's rhythm. A caller who believed the old version would reach for a class
to hold a property inside an article and watch it lose; the honest answer is an
inline style, or a tag the stylesheet does not reach.

**`CodeBlock` documented a trade without its consequence.** Line numbers live
inside each line's row so a number cannot come apart from the line it numbers.
The cost went unsaid: the number is inside the scrolling box, so on a wide
snippet it scrolls away with the code rather than staying in a gutter. A gutter
that stayed put would be the second column this deliberately avoids — worth
knowing before someone reports it as a bug.
