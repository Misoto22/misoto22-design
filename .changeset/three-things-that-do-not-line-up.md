---
'@misoto22/design': patch
---

Three things that did not line up.

**`Sidebar` renders without a provider.** It threw, which is defensible for a
hook a consumer called by hand and wrong for the component: `<Sidebar>` on its
own is the first thing anybody writes, and the documentation site's own props
panel renders exactly that and got an error boundary instead of a rail. The
parts now fall back to the state a rail with no controls would be in — open,
not collapsible. `useSidebar` still throws, because a call to the hook is code
asking for state nothing is keeping.

**`ErrorState`'s code was set `leading-none`.** At the title step this face
draws about 62px of ink and a line box of exactly the font size is 47, so the
figures overflowed their own box by seven pixels at each end — pressing against
the eyebrow above and eating a third of the gap to the heading below. It has a
real line box now, and the space the layout asks for is the space that appears.

**`TD` says why it is top-aligned, and when not to be.** A 36px row action
beside 16px of text makes a 52px row, and top-aligned every other cell hangs at
the top of it with twenty pixels of nothing underneath.
