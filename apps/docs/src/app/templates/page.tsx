import { Badge, Card, CardBody, CardTitle, Tag } from '@misoto22/design'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageIntro } from '@/components/PageIntro'
import { TEMPLATES } from '@/content/templates'

export const metadata: Metadata = {
  title: 'Templates',
  description: 'Whole screens assembled from the set, at two opposite densities.',
}

export default function TemplatesIndex() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <PageIntro
        eyebrow="Start"
        title="Templates"
        summary="A gallery answers what a Table looks like. These answer the question after it — which components a real screen needs together, and how they space against each other once there are twelve of them rather than one."
        crumbs={[{ label: 'Templates' }]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((template) => (
          <Link key={template.slug} href={`/templates/${template.slug}/`} className="group block h-full">
            <Card className="h-full transition-colors duration-(--duration-fast) group-hover:border-(--rule-hard)">
              <CardBody className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle>{template.name}</CardTitle>
                  <Badge tone="outline">{template.uses.length} components</Badge>
                </div>
                <p className="m-0 text-[13px] leading-relaxed text-(--ink-3-aa)">
                  {template.summary}
                </p>
                <p className="m-0 border-s border-(--rule-2) ps-3 text-[13px] leading-relaxed text-(--ink-2)">
                  {template.tests}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {template.uses.slice(0, 6).map((name) => (
                    <Tag key={name}>{name}</Tag>
                  ))}
                  {template.uses.length > 6 && <Tag>+{template.uses.length - 6}</Tag>}
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
