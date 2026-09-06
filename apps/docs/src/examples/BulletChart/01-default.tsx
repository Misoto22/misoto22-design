import { BulletChart } from '@misoto22/design/charts'

// One shared 0–100 scale, so the bands mean the same thing on every row and
// the measures can be compared with each other as well as with their targets.
const data = [
  { name: 'Availability', value: 96, target: 99 },
  { name: 'Support CSAT', value: 84, target: 80 },
  { name: 'Onboarding completion', value: 61, target: 75 },
  { name: 'Docs coverage', value: 43, target: 70 },
]

export function Example() {
  // No rendering engine and no state: each row is one linear scale, so the
  // whole chart is HTML and renders on the server.
  return (
    <BulletChart
      title="Quarterly targets"
      showTitle
      description="Bar is the measure, rule is the target"
      data={data}
      ranges={[50, 80]}
      domain={[0, 100]}
    />
  )
}
