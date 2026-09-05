import { LinkArrow } from '@misoto22/design'

export function Example() {
  return (
    <p className="m-0 text-sm text-(--ink-2)">
      <a
        href="https://misoto22.com"
        className="text-(--ink) underline decoration-(--rule-2) underline-offset-4 hover:decoration-(--ink)"
      >
        Read the whole thing
        <LinkArrow />
      </a>
    </p>
  )
}
