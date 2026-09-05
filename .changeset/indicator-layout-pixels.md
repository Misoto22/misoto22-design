---
'@misoto22/design': patch
---

`ToggleGroup`'s sliding pill lands on its segment inside a scaled container.

The indicator measured with `getBoundingClientRect`, which reports visual
pixels, and positioned with `transform`, which is interpreted in the element's
own coordinate space. Inside anything zoomed or scaled — a thumbnail, a device
preview — the two disagreed by exactly the scale factor and the pill sat short
of its segment. It now accumulates layout offsets up to the strip instead.
