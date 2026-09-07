---
'@misoto22/design': patch
---

`RadarChart.Radar` fills again instead of handing the SVG `NaN`.

The default fill opacity follows `--chart-fill` through a `calc()`, so it reads
on both grounds without the component knowing which one it is on. That value is
a string, and the dimming factor was applied to it in JS — `'calc(…)' * 1` is
`NaN`, which React writes to `fill-opacity` after warning once in the console.
Every unselected radar therefore lost its fill, on every render, since the
default path never went through a number at all.

The factor multiplies inside the `calc()` now. A number passed as
`fillOpacity` still scales the way it always did.

A gate walks every chart's rendered attributes and fails on any `NaN`, because
nothing else would have noticed: jsdom has no layout, and the hidden table each
chart carries still read correctly the whole time.
