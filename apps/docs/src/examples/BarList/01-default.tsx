'use client'

import { BarList } from '@misoto22/design/charts'

const referrers = [
  { name: 'google.com', value: 42_100 },
  { name: 'github.com', value: 18_800 },
  { name: 'news.ycombinator.com', value: 9_400 },
  { name: 'x.com', value: 6_120 },
  { name: 'reddit.com', value: 3_280 },
  { name: 'lobste.rs', value: 1_940 },
  { name: 'bsky.app', value: 1_100 },
  { name: 'linkedin.com', value: 640 },
]

export function Example() {
  // The bar sits BEHIND the name rather than beside it, which is what a
  // horizontal bar chart cannot do: reading a name off a y-axis and matching
  // it to a bar is two steps, and reading it off the bar is none.
  return <BarList label="Top referrers" showLabel items={referrers} />
}
