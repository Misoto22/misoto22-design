---
'@misoto22/design': minor
---

Add eleven components and make the table do what a table is for.

`Popover`, `Sheet`, `ContextMenu`, `Command` (the ⌘K palette), `Combobox`,
`Slider`, `ToggleGroup`, `Collapsible`, `ScrollArea`, `Calendar` and
`DatePicker`. Each documents the neighbour it could be confused with, because
the interesting question is rarely how a component looks: a tooltip cannot hold
a control, an accordion of one manages a value nobody reads, a native select
beats a combobox up to about a dozen options, and a toggle group changes a
value where tabs change a panel.

`Table` gains sortable headers and a sticky header row. The sort control is a
`<button>` inside the `<th>` rather than a click handler on the cell — a cell
with an `onClick` is not focusable and not announced, so the sort exists only
for a mouse — and it sets `aria-sort`, which is the only way a screen reader
learns the table is ordered at all.

`Dialog` gains `hideTitle`, for a surface whose purpose is obvious to anyone
who can see it. The title itself stays required.

Two defects the browser suite caught on the way in: the calendar's
out-of-month days were drawn in the rule colour at 1.38:1, and `cmdk` renders
its separator as `role="separator"` inside a `role="listbox"`, which ARIA
forbids and which put a critical violation inside every palette.
