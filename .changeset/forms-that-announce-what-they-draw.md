---
'@misoto22/design': minor
---

The form controls now announce what they draw.

`Field` drew a hint, an error and a required marker under six of the twelve
controls it wraps and announced none of them. The wiring travelled by
`cloneElement`, and each of those six dropped it: Radix's select root renders no
DOM node at all, `Combobox` and `DatePicker` never spread what they were handed,
the slider root is a roleless `<span>`, and `<label for>` does not bind to a
`<div role="radiogroup">`. Every one of them rendered perfectly and was invisible
to a screen reader, which is the only kind of defect a review of the browser
cannot find.

- **The wiring reaches the element that carries the role.** `Select`, `Combobox`
  and `DatePicker` put the id, `aria-describedby`, `aria-required` and
  `aria-invalid` on their TRIGGER — so the visible label clicks through to it and
  the message below is announced; `RadioGroup` and `ToggleGroup` take them on the
  group root; `Slider` moves them onto the THUMB, which is where `role="slider"`
  lives. Two limits are now stated rather than implied: the words above a group
  name it through `aria-labelledby` and do not click through, the way a
  `<legend>` does not, and `required` has nowhere to sit on `DatePicker`'s plain
  `<button>` trigger, where the asterisk is the whole of the marking.

- **A trigger announces its value as well as its name.** `Select`, `Combobox`,
  `DatePicker` and `DateRangePicker` set `aria-label={label}` on a trigger whose
  text IS the current value, and `aria-label` outranks name-from-content — so a
  reader was told "Tags" and never "3 selected", and `DatePicker`'s `format`
  reached the screen and nothing else. The trigger is now named by the label and
  by its own value together: "Region, Australia". Inside a `Field` with a label,
  that label is the name and the control's own `label` is not repeated.

- **`Select` reads `aria-invalid`.** It was the one control on `CONTROL_BASE`
  calling `isInvalid` with a single argument, so a `Field` error — or a form
  library — painted the message red under a resting border. `Combobox` picks up
  the same danger border.

- **`<Slider label="Volume" />` renders a thumb.** The thumbs come from this
  component's own array, which was empty when neither `value` nor `defaultValue`
  was given, so the plainest possible usage drew a track with nothing on it to
  drag. It now falls back to the primitive's own default of one thumb at the
  minimum. Three more on the same control: `disabled` dims it (the old
  `disabled:` variant compiled to `&:disabled`, which never matches the `<span>`
  it was on), `format` becomes each thumb's `aria-valuetext` instead of changing
  only the printed readout, and `showValue` prints one name per thumb rather than
  the first name over a pair of numbers.

- **`<Checkbox defaultChecked="indeterminate" />` draws the dash.** The glyph was
  chosen from `props.checked`, which an uncontrolled box never sets, so a
  partly-selected list showed the tick that means "all of them".

- **`DatePicker` presets respect `disabledDates`.** The rail set the value the
  grid beside it would refuse. A shortcut landing on a blocked day is now drawn
  unavailable and refuses the click; a range preset is tested at its ends.

- **Layout.** `NativeSelect`'s `className` now sizes the WRAPPER the chevron is
  pinned to — on the `<select>` it narrowed the box and left the arrow floating
  at the far edge of the row. Note the change of target: colours and borders sent
  through `className` no longer reach the `<select>`, which keeps `CONTROL_BASE`.
  `Select`'s trigger truncates its value, so one long option no longer makes the
  field taller than the one beside it.

- **`aria-required` stays off a role that cannot take it.** A `Field`'s
  `required` around `<ToggleGroup type="multiple">` put the attribute on a
  `role="toolbar"`, where ARIA does not allow it.

`Select`, `Combobox`, `DatePicker` and `DateRangePicker` accept `id`,
`aria-describedby` and `aria-invalid` (and `aria-required`, where the role
permits it) as ordinary props, so a form library can address them without a
`Field`.
