---
'@misoto22/design': minor
---

Configurable Table, a searchable action menu, and calendar/date-picker repairs.

- `Table` takes `borders` (`rows` | `grid` | `bordered` | `bordered-grid` | `none`),
  `density`, per-column `align`, and per-column opt-in `sortable` with
  `sortDirection` / `onSort`. All rules are drawn from the wrapper, so the
  component stays server-renderable.
- New `SearchableMenu`: a filterable menu of actions, for the case
  `DropdownMenu` outgrows and `Combobox` does not fit (it sets no value).
- `Calendar` month and year pickers are our own `Select` rather than the native
  dropdown, and span 10 years either side instead of the full century.
- A selected day is round again. In range mode a one-day selection was both
  range start and range end, and the two overrides summed to `border-radius: 0`.
- `DatePicker` and `DateRangePicker` take `presets`: a shortcut rail (Last 30
  days, Last 90 days, Year to date…), computed on click so "today" means today.
