import { Badge, Card, CardBody, CardTitle } from '@misoto22/design'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { COMPONENTS, groupedComponents } from '@/content/registry'

export const metadata: Metadata = {
  title: 'Components',
  description: `All ${COMPONENTS.length} components in @misoto22/design, grouped by what they do.`,
}

export default function ComponentsIndex() {
  const sections = groupedComponents()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
      <PageIntro
        eyebrow="Reference"
        title="Components"
        summary={`${COMPONENTS.length} primitives, grouped by what they do rather than by what they are made of. Every one is styled against the token layer, so none of them carries a colour of its own.`}
        crumbs={[{ label: 'Components' }]}
      />

      {sections.map((section) => (
        <section key={section.group} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <SectionHeading id={section.group.toLowerCase()}>{section.group}</SectionHeading>
            <Badge tone="outline">{section.entries.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.entries.map((entry) => (
              <Link
                key={entry.slug}
                href={`/components/${entry.slug}/`}
                className="group block h-full"
              >
                <Card className="h-full transition-colors duration-(--duration-fast) group-hover:border-(--rule-hard)">
                  <CardBody className="flex h-full flex-col gap-2">
                    <CardTitle>{entry.name}</CardTitle>
                    <p className="m-0 text-[13px] leading-relaxed text-(--ink-3-aa)">
                      {entry.summary}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
