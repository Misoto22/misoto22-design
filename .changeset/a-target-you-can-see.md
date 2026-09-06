---
'@misoto22/design': patch
---

`BulletChart` draws its target where the target is.

Two ways the rule went missing, and the second one is the common case.

A fixed half-width pull put a target at the bottom of the scale half outside
the track, where `overflow-hidden` took it — so "Open incidents, target 0" drew
no target at all, on the one measure whose whole point is the distance from it.
The pull is proportional now: flush at the start at 0, flush at the end at 1,
centred on its position everywhere between.

And the rule is drawn in `--ink` on a bar drawn in `--ink`, so wherever the
target sat INSIDE the achieved range it was an ink rule on an ink bar and
simply not there — which is every measure that is meeting its target. It now
carries a paper halo, so it reads against the bar and against the bands alike.
