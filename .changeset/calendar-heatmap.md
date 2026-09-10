---
'@misoto22/design': minor
---

`CalendarHeatmap` — a year of daily readings as a week-by-week grid, built from the dates rather than from the order of the array.

`Heatmap` draws named rows and columns and knows nothing about dates, so every
consumer wrote the calendar on top of it and none of them wrote it the same way
twice. What that costs is not effort but correctness: given a bare list of
counts, one missing Tuesday shifts every reading after it by a cell, and the
result is a plausible picture of a year that did not happen.

**A day with no entry is a gap, not a zero.** "Nothing happened" and "nothing
was recorded" are different readings, and a grid that draws them alike invites
the reader to explain an outage that was a hole in collection. `null` renders as
a dashed outline and announces "no data"; zero is the palest cell on the ramp.

Every bound is a UTC midnight parsed out of `YYYY-MM-DD`, because a local-time
calendar drawn in two timezones is two different calendars and the disagreement
is exactly one day wide — small enough to survive review, large enough to move a
reading into the wrong week.

`Heatmap.formatValue` now receives the cell as well as the number. It is what
makes `describe(value, date)` possible at all: two days with the same count are
two different readings, and the row and column a cell is announced with are a
weekday and a month spanning five weeks. Existing callers are unaffected — the
parameter is additional and a one-argument formatter still satisfies the type.
