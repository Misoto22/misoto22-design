---
'@misoto22/design': patch
---

A filled radar paints at its own opacity again.

`fillOpacity` on `RadarChart.Radar` defaults to a CSS `calc()` — the fill has
to follow `--chart-fill`, which holds a different number on each ground, so the
component must not resolve it. That string was typed as a number with a double
cast and then multiplied by the dim factor, and `"calc(…)" * 1` is `NaN`. React
drops a NaN attribute, so the browser fell back to the SVG default of
`fill-opacity: 1`: every filled radar has been painting at full strength rather
than at 0.31, and two overlapping series hid each other rather than reading
through.

The dim factor folds into the calc instead of multiplying it. An explicit
numeric `fillOpacity` is still a number and is still dimmed by multiplication.

It announced itself the whole time, on every render, as `Received NaN for the
fillOpacity attribute` — a console line that names an attribute and no
component, on a page that renders ninety-five thumbnails. The test now watches
the console as well as the attribute, because the warning was the only signal
this ever had.
