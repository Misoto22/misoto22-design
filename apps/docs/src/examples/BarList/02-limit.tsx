'use client'

import { BarList } from '@misoto22/design/charts'

const referrers = [
  { name: 'google.com', value: 42_100, href: 'https://google.com' },
  { name: 'github.com', value: 18_800, href: 'https://github.com' },
  { name: 'news.ycombinator.com', value: 9_400, href: 'https://news.ycombinator.com' },
  { name: 'x.com', value: 6_120 },
  { name: 'reddit.com', value: 3_280 },
  { name: 'lobste.rs', value: 1_940 },
  { name: 'bsky.app', value: 1_100 },
  { name: 'linkedin.com', value: 640 },
]

export function Example() {
  // The tail is SUMMED into "Other" rather than dropped. A top three that
  // silently discards the other five misstates the whole, and the reader has
  // no way to tell it happened.
  return <BarList label="Top referrers" showLabel items={referrers} limit={3} />
}
