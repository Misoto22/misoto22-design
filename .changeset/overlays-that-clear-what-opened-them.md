---
'@misoto22/design': minor
---

Overlays now clear the surface that opened them, and reach the container that
asked for them.

**A select inside a modal form was painted behind the modal.** `--z-dropdown`
resolved to `--z-drawer`, 100, while a dialog panel sits at `--z-modal`, 210.
Every overlay in the package portals to `document.body`, so all of them are
siblings in the root stacking context and the rank is the whole of the decision
— there is no ancestor left to nest one inside another. A `Popover`,
`DropdownMenu`, `Select` or `SearchableMenu` opened from inside a `Dialog` or a
`Sheet` was therefore invisible in exactly the case it is most used.

The ladder gains `--z-anchored` at 220, above the modal and below the toast, and
`--z-dropdown` points at it. **`--z-palette` is removed**: it was read by
nothing, and it could not have worked — a command palette is a `Dialog`, so it
lands at `--z-modal`, and its order against a second modal is settled by
document order, which moves a scrim and its panel together where a lone panel
rank would have separated them. The count stays at seven ranks, and the
reasoning is written into `tokens.css` beside the numbers.

**`OverlayContainer` now redirects every overlay, which is what it always said
it did.** `Dialog` and `Sheet` rendered the Radix portal with no container and
never called `useOverlayContainer`; their props derive from `Content`, which has
no `container`, so a caller could not pass one either. Both now read it — and
switch from `fixed` to `absolute` when a container is named, because a `fixed`
panel resolves against the viewport whatever element it is portalled into, so
honouring the container without that swap would have moved the markup and left
the picture unchanged. A modal inside a bounded frame now stays in the frame and
inherits the `dir`, `data-density` and theme axes set there.

**`SearchableMenu` filtered on the id instead of the label.** cmdk derives an
item's value from the first string in `[value, children, ref]` and only falls
back to the row's text when `value` is absent; this passed `action.id`, so with
the opaque ids an application actually has, typing the words a reader can see
matched nothing and the menu showed its empty state. The label's own text is now
lifted into the row's keywords, with the id still the identity. A label built
only from elements prints no text to lift, and development says so
(`SEARCHABLE_MENU_LABEL_UNREADABLE`) rather than shipping a row nothing matches.

**`icon` meant opposite things one import apart.** `DropdownMenuItem.icon` and
`ContextMenuItem.icon` took the Lucide component; `CommandItem.icon` took the
rendered element. All three now take either, and the wrong guess no longer fails
at render.

**`DropdownMenuGroup` and `ContextMenuGroup` are new.** Radix's `MenuLabel` is a
bare `<div>` with no role and no `aria-labelledby` wiring, and `MenuGroup` — the
one that carries `role="group"` — was not re-exported at all, so the sections a
sighted reader saw arrived as one undivided list. The group renders the label
inside itself and points the one at the other, which is not something a caller
should have to remember. `DropdownMenuLabel` stays, for a line that heads
nothing.

**A dialog with no title says so.** The fallback accessible name is the literal
string "Dialog", so every unnamed modal in an application announced identically
— and passed an automated accessibility check while doing it, which is how the
problem survives a review. The fallback still renders, because an unnamed modal
is worse; development now warns `DIALOG_TITLE_MISSING`.

**`SheetContent` carries `data-m22-animated`.** Its scrim always asserted that
its fade was decorative and the panel never did, so under `prefers-reduced-motion`
the fade was cancelled and the panel still travelled the full width of itself.

**The portable CSS recipe was missing a layer.** `README.md` told an app that
compiles its own Tailwind to import `tokens.css`, `semantic.css` and
`keyframes.css`. `data-mode` and `data-density` live in `tokens.css` and
survived; `data-surface`, `data-radius`, `data-rules`, `data-type`,
`data-motion` and `data-chart-palette` are declared only in `themes.css`, which
the recipe never mentioned — so a consumer wrote `data-radius="sharp"` and got
no error, no warning and no corner. The split is deliberate: `themes.css` is its
own export, attribute-scoped where `semantic.css` is `:root`-scoped, and the
package's own tests hold the two apart. So the recipe names all four layers, and
a test derives the axes from the stylesheets and fails when a documented recipe
stops reaching one.
