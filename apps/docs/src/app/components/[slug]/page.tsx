import { Alert, Badge, Separator } from '@misoto22/design'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleCanvas } from '@/components/ExampleCanvas'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
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

/**
 * JSDoc prose, rendered as paragraphs with inline code.
 *
 * A full Markdown pipeline would be a dependency and a build step for the two
 * pieces of syntax these comments actually use — blank-line paragraphs, and
 * backticks. Anything richer belongs in the registry, not in a doc comment.
 */
function Prose({ text, small = false }: { text: string; small?: boolean }) {
  return (
    <div className={`flex max-w-(--w-reading) flex-col gap-3 ${small ? 'text-[13px]' : 'text-sm'}`}>
      {text.split(/\n\s*\n/).map((paragraph, index) => (
        <p key={index} className="m-0 leading-relaxed text-(--ink-2)">
          {paragraph.split(/(`[^`]+`)/).map((part, partIndex) =>
            part.startsWith('`') && part.endsWith('`') ? (
              <code
                key={partIndex}
                className="rounded-(--radius-sm) bg-(--stone) px-1.5 py-0.5 font-mono text-xs text-(--ink)"
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              <span key={partIndex}>{part.replace(/\n/g, ' ')}</span>
            ),
          )}
        </p>
      ))}
    </div>
  )
}
