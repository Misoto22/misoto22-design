---
'@misoto22/design': minor
---

`Tag` owns the filter case, and `Markdown` finishes the link boundary.

Both shipped hours ago and both were found by their first consumer.

- `Tag` takes an `onClick`. The advice used to be to wrap a tag in a button at
  the call site, which is fine alone and invalid the moment the chip is also
  removable: the remove control is a real `<button>`, so the wrapper made a
  button inside a button — markup a parser splits into siblings, leaving a DOM
  neither the author nor the accessibility tree expects. A removable filter
  chip is an ordinary thing to want, so the component now owns it. With
  `onClick` the chip IS the button, carrying `aria-pressed` from `active`; with
  both handlers the label and the X render as sibling buttons, and the label
  takes the leading padding with it so the target is the chip up to the X
  rather than the words with dead space around them. `aria-pressed` is emitted
  only when `active` is passed, so a chip that navigates does not announce
  itself as "not pressed".

- A `Markdown` link that leaves for another site now carries
  `rel="noreferrer nofollow"`. Refusing `javascript:` stops the href
  EXECUTING; it does nothing about an untrusted author spending the page's
  ranking or reading its URL out of the `Referer`, and untrusted content is the
  input this component exists for. Relative, `mailto:` and `tel:` hrefs cannot
  leave the origin and are untouched. New opt-in `markExternalLinks` adds the
  system's outbound arrow to the same links; it is off by default because the
  mark is an addition to a sentence the component did not write, and because
  "another site" can only mean "carries an http(s) scheme" from in here.

Documentation caught up with three things that were already true: `Markdown`
brings type and colour but no vertical rhythm, so anything longer than a
sentence wants `<Article as="div">` around it; a fenced code block renders
`CodeBlock`, which is a client component; and `article.css`'s header comment
said a utility beats the article's rules, which is backwards — the file is
imported unlayered while Tailwind's utilities are in `@layer utilities`, and
that is precisely what lets a `Markdown` paragraph's `m-0` give way to the
article rhythm.
