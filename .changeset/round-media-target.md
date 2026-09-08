---
'@misoto22/design': minor
---

Media-detail return controls now retain a 44px touch target after browser subpixel rounding.

A 0.25px safety margin prevents a declared 44px target from measuring just under 44px in a real browser layout.

Media page compositions accept `headingLevel` when they are embedded inside an existing document outline.

The default remains an `h1` for standalone pages, while an embedded composition can use the heading level that follows its host section.
