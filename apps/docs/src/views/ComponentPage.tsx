import { apiCopy } from '@/i18n/api'
import { componentCopy, componentName, groupName } from '@/i18n/content'
import { localePath, type Locale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { Alert, Badge, Kbd, Separator, TBody, TD, TH, THead, TR, Table } from '@misoto22/design'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleCanvas } from '@/components/ExampleCanvas'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { Prose } from '@/components/Prose'
import { PropsTable } from '@/components/PropsTable'
import { BY_SLUG } from '@/content/registry'
import { componentExamples, componentSource, componentTypes } from '@/lib/docs'

export async function ComponentPage({ locale, slug }: { locale: Locale; slug: string }) {
  const entry = BY_SLUG.get(slug)
  if (!entry) notFound()

  const t = getMessages(locale)
  const zh = componentCopy(locale, entry.slug)
  const source = componentSource(entry.dir)
  const examples = componentExamples(entry.dir)
  const types = componentTypes(entry.dir)

  // The export that shares the directory's name is the component the page is
  // about; the rest are its named parts (CardHeader, TabsTrigger) and are
  // documented under it rather than each getting a page of their own.
  const primary = source.components.find((component) => component.name === entry.dir)
  const parts = source.components.filter(
    (component) => component.name !== entry.dir && !component.reexport,
  )
  const reexports = source.components.filter((component) => component.reexport)
  const related = (entry.related ?? []).map((s) => BY_SLUG.get(s)).filter(Boolean)

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      <PageIntro
        eyebrow={groupName(locale, entry.group)}
        title={componentName(locale, entry.slug, entry.name)}
        summary={zh.summary ?? entry.summary}
        crumbs={[
          { label: t.section.components, href: localePath(locale, '/components/') },
          { label: componentName(locale, entry.slug, entry.name) },
        ]}
      />

      {(zh.when ?? entry.when) && (
        <Alert title={t.section.whenToReach} hideIcon>
          {zh.when ?? entry.when}
        </Alert>
      )}

      {examples.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="examples">{t.section.examples}</SectionHeading>
          {examples.map((example) => (
            <div key={example.id} className="flex flex-col gap-3">
              <p className="m-0 eyebrow text-(--ink-3-aa)">{example.title}</p>
              <ExampleCanvas
                exampleKey={`${entry.dir}/${example.id}`}
                html={example.html}
                snippet={example.snippet}
                previewHeight={entry.previewHeight}
              />
            </div>
          ))}
        </section>
      )}

      {primary?.description && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="notes">{t.section.notes}</SectionHeading>
          <Prose text={apiCopy(locale, `${entry.dir}.${primary.name}`, primary.description)} />
        </section>
      )}

      <section className="flex flex-col gap-5">
        <SectionHeading id="props">{t.section.props}</SectionHeading>
        <PropsTable
          name={primary?.name ?? entry.name}
          dir={entry.dir}
          rows={primary?.props ?? []}
          passthrough={primary?.passthrough ?? []}
          locale={locale}
        />
      </section>

      {parts.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="parts">{t.section.parts}</SectionHeading>
          <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-3-aa)">
            Composed at the call site rather than configured through props, so a layout this
            component did not anticipate is still expressible.
          </p>
          {parts.map((part) => (
            <div key={part.name} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <h3 className="m-0 font-mono text-sm text-(--ink)">{part.name}</h3>
              </div>
              {part.description && (
                <Prose text={apiCopy(locale, `${entry.dir}.${part.name}`, part.description)} small />
              )}
              <PropsTable
                name={part.name}
                dir={entry.dir}
                rows={part.props}
                passthrough={part.passthrough}
                locale={locale}
              />
            </div>
          ))}
        </section>
      )}

      {reexports.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="reexports">{t.section.reexports}</SectionHeading>
          <div className="flex flex-col gap-3">
            {reexports.map((item) => (
              <div key={item.name} className="flex flex-col gap-1">
                <code className="font-mono text-sm text-(--ink)">
                  {item.name} = {item.reexport}
                </code>
                {item.description && (
                  <Prose text={apiCopy(locale, `${entry.dir}.${item.name}`, item.description)} small />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {types && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="types">{t.section.types}</SectionHeading>
          <CodeBlock {...types} />
        </section>
      )}

      {entry.keyboard && entry.keyboard.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="keyboard">{t.section.keyboard}</SectionHeading>
          <Table caption={`${entry.name} keyboard interactions`}>
            <THead>
              <TR>
                <TH className="w-48">{t.table.key}</TH>
                <TH>{t.table.does}</TH>
              </TR>
            </THead>
            <TBody>
              {entry.keyboard.map((row, index) => (
                <TR key={row.keys.join('+')}>
                  <TD className="align-top">
                    <span className="flex flex-wrap gap-1.5">
                      {row.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </TD>
                  <TD className="max-w-(--measure-record) align-top text-[13px] leading-relaxed">
                    {zh.keyboard?.[index] ?? row.does}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </section>
      )}

      {entry.accessibility && entry.accessibility.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="accessibility">{t.section.accessibility}</SectionHeading>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {(zh.accessibility ?? entry.accessibility).map((note) => (
              <li
                key={note}
                className="max-w-(--w-reading) border-s border-(--rule-2) ps-4 text-sm leading-relaxed text-(--ink-2)"
              >
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <>
          <Separator />
          <section className="flex flex-col gap-4">
            <SectionHeading id="related">{t.section.related}</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {related.map((item) => (
                <Link key={item!.slug} href={localePath(locale, `/components/${item!.slug}/`)}>
                  <Badge tone="outline">{item!.name}</Badge>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  )
}

