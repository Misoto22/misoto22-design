'use client'

import { Accordion, AccordionItem } from '@misoto22/design'

export function Example() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="install" title="How do I install it?">
        <code className="font-mono text-xs">pnpm add @misoto22/design</code>, then import the stylesheet once
        at your app root.
      </AccordionItem>
      <AccordionItem value="tailwind" title="Do I need Tailwind?">
        No. The compiled stylesheet is self-contained. If you already compile Tailwind, import the token
        layers instead and skip the second copy of the utilities.
      </AccordionItem>
      <AccordionItem value="router" title="Which router does it assume?">
        None. Components that navigate take <code className="font-mono text-xs">asChild</code>, so you hand
        them your own Link.
      </AccordionItem>
    </Accordion>
  )
}
