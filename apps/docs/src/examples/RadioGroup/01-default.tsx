import { RadioGroup, RadioGroupItem } from '@misoto22/design'

export function Example() {
  return (
    <RadioGroup defaultValue="system" aria-label="Appearance">
      <RadioGroupItem value="light">Light</RadioGroupItem>
      <RadioGroupItem value="dark">Dark</RadioGroupItem>
      <RadioGroupItem value="system">Match the system</RadioGroupItem>
    </RadioGroup>
  )
}
