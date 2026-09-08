import { componentCopy, componentName } from '@/i18n/content'
import { localePath, type Locale } from '@/i18n/locales'
import { Badge, Card, CardBody, CardTitle } from '@misoto22/design'
import Link from 'next/link'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { groupedPatterns } from '@/content/registry'
import { ComponentThumb } from '@/components/ComponentThumb'
import { componentExamples } from '@/lib/docs'

/** The first runnable example gives each pattern card a real, not decorative, preview. */
function first(dir: string): string | undefined {
  const example = componentExamples(dir)[0]
  return example ? `${dir}/${example.id}` : undefined
}

/**
 * Website patterns are composed surfaces. They remain discoverable and fully
 * documented, without claiming to be another catalogue of primitives.
 */
export function PatternsIndex({ locale }: { locale: Locale }) {
  const sections = groupedPatterns()
  const title = locale === 'zh' ? '网站模式' : 'Website patterns'
  const summary = locale === 'zh'
    ? '由组件组合而成的页面结构。应用负责内容、路由和服务状态；模式负责它们如何一起工作。'
    : 'Application-shaped compositions built from components. Hosts own content, routing and service state; patterns show how the pieces work together.'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
      <PageIntro eyebrow={locale === 'zh' ? '参考' : 'Reference'} title={title} summary={summary} crumbs={[{ label: title }]} />

      {sections.map((section) => (
        <section key={section.group} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <SectionHeading id={section.group.toLowerCase()}>{title}</SectionHeading>
            <Badge tone="outline">{section.entries.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {section.entries.map((entry) => (
              <Card
                key={entry.slug}
                className="group relative h-full overflow-hidden transition-colors duration-(--duration-fast) hover:border-(--rule-hard)"
              >
                <CardBody className="flex h-full flex-col">
                  {first(entry.dir) && <ComponentThumb exampleKey={first(entry.dir)!} />}
                  <div className="h-20">
                    <CardTitle>
                      <Link
                        href={localePath(locale, `/patterns/${entry.slug}/`)}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {componentName(locale, entry.slug, entry.name)}
                      </Link>
                    </CardTitle>
                    <p className="m-0 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-(--ink-3-aa)">
                      {componentCopy(locale, entry.slug).summary ?? entry.summary}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
