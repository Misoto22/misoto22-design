---
'@misoto22/design': patch
---

Media-detail return controls now retain a 44px touch target after browser subpixel rounding.

A 0.25px safety margin prevents a declared 44px target from measuring just under 44px in a real browser layout.
