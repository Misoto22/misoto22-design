import { Alert, Badge, Kbd, Separator, TBody, TD, TH, THead, TR, Table } from '@misoto22/design'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleCanvas } from '@/components/ExampleCanvas'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { Prose } from '@/components/Prose'
import { PropsTable } from '@/components/PropsTable'
import { BY_SLUG, COMPONENTS } from '@/content/registry'
import { componentExamples, componentSource, componentTypes } from '@/lib/docs'

export function generateStaticParams() {
  return COMPONENTS.map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = BY_SLUG.get(slug)
  if (!entry) return {}
  return { title: entry.name, description: entry.summary }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = BY_SLUG.get(slug)
  if (!entry) notFound()

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
        eyebrow={entry.group}
        title={entry.name}
        summary={entry.summary}
        crumbs={[
          { label: 'Components', href: '/components/' },
          { label: entry.name },
        ]}
      />

      {entry.when && (
        <Alert title="When to reach for it" hideIcon>
          {entry.when}
        </Alert>
      )}

      {examples.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="examples">Examples</SectionHeading>
          {examples.map((example) => (
            <div key={example.id} className="flex flex-col gap-3">
              <p className="m-0 eyebrow text-(--ink-3-aa)">{example.title}</p>
              <ExampleCanvas
                exampleKey={`${entry.dir}/${example.id}`}
                html={example.html}
                snippet={example.snippet}
              />
            </div>
          ))}
        </section>
      )}

      {primary?.description && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="notes">Notes</SectionHeading>
          <Prose text={primary.description} />
        </section>
      )}

      <section className="flex flex-col gap-5">
        <SectionHeading id="props">Props</SectionHeading>
        <PropsTable
          name={primary?.name ?? entry.name}
          rows={primary?.props ?? []}
          passthrough={primary?.passthrough ?? []}
        />
      </section>

      {parts.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="parts">Parts</SectionHeading>
          <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-3-aa)">
            Composed at the call site rather than configured through props, so a layout this
            component did not anticipate is still expressible.
          </p>
          {parts.map((part) => (
            <div key={part.name} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <h3 className="m-0 font-mono text-sm text-(--ink)">{part.name}</h3>
              </div>
              {part.description && <Prose text={part.description} small />}
              <PropsTable name={part.name} rows={part.props} passthrough={part.passthrough} />
            </div>
          ))}
        </section>
      )}

      {reexports.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="reexports">Re-exports</SectionHeading>
          <div className="flex flex-col gap-3">
            {reexports.map((item) => (
              <div key={item.name} className="flex flex-col gap-1">
                <code className="font-mono text-sm text-(--ink)">
                  {item.name} = {item.reexport}
                </code>
                {item.description && <Prose text={item.description} small />}
              </div>
            ))}
          </div>
        </section>
      )}

      {types && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="types">Types</SectionHeading>
          <CodeBlock html={types.html} source={types.source} />
        </section>
      )}

      {entry.keyboard && entry.keyboard.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="keyboard">Keyboard</SectionHeading>
          <Table caption={`${entry.name} keyboard interactions`}>
            <THead>
              <TR>
                <TH className="w-48">Key</TH>
                <TH>Does</TH>
              </TR>
            </THead>
            <TBody>
              {entry.keyboard.map((row) => (
                <TR key={row.keys.join('+')}>
                  <TD className="align-top">
                    <span className="flex flex-wrap gap-1.5">
                      {row.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </TD>
                  <TD className="max-w-(--measure-record) align-top text-[13px] leading-relaxed">
                    {row.does}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </section>
      )}

      {entry.accessibility && entry.accessibility.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="accessibility">Accessibility</SectionHeading>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {entry.accessibility.map((note) => (
              <li
                key={note}
                className="max-w-(--w-reading) border-l border-(--rule-2) pl-4 text-sm leading-relaxed text-(--ink-2)"
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
            <SectionHeading id="related">Related</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {related.map((item) => (
                <Link key={item!.slug} href={`/components/${item!.slug}/`}>
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

