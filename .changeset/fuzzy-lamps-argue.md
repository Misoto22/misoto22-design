---
'@misoto22/design': minor
---

Fix the interactions that were drawn but not wired, and give selection
something that moves.

`Select` is now the styled control and the native one becomes `NativeSelect`.
The old default stopped being part of the system the moment it opened — the
option list is drawn by the operating system and carries none of these tokens.
The one genuine argument for staying native was the keyboard contract, and
Radix answers it: typeahead, arrows, Home and End, Escape without choosing.

`Slider` printed a figure that never moved. It read the value off the props, and
an uncontrolled slider's `defaultValue` does not change — so the number sat at
its starting point while the thumb travelled, which is the one thing `showValue`
exists to prevent.

`ToggleGroup` looked identical whether it held one value or several, so a
multiple-value group looked like a broken single one. A single-value strip now
moves ONE pill between its options and a multiple-value strip fills each
pressed option separately. `Pagination` gets the same treatment: a shape that
travels reads as the one thing that changed, where two backgrounds cross-fading
reads as two.

`Combobox` takes several values, keeps the panel open while you pick them, and
clips the command list to its own corners — the list's square edges had been
poking through the panel's radius.

`Calendar` navigates by month and year dropdowns rather than two arrows.
Twenty-four clicks to reach two years ago is not a navigation model. Its nav
also sat above the grid rather than beside the caption, because the nav renders
first in the DOM and was left in the flow.

`DateRangePicker` is new. It shows two months, and closes only once two days
have actually been clicked — the library reports `{ from, to }` on the FIRST
click, so a completeness check closed the panel instantly and produced a
one-day range every time.

`Switch` narrows its thumb as it travels, and `Slider`'s grows as it is
grabbed, so both read as something being moved rather than a value blinking to
a new state.
