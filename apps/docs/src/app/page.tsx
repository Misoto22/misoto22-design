import { Button, FigureBand, StatusPill } from '@misoto22/design'
import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { PageIntro, SectionHeading } from '@/components/PageIntro'
import { FOUNDATIONS } from '@/content/foundations'
import { COMPONENTS, groupedComponents } from '@/content/registry'
import { snippet, snippetSource, tokenCount } from '@/lib/docs'

export default function Home() {
  const groups = groupedComponents()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
      <PageIntro
        eyebrow="misoto22 design"
        title="The White Reset"
        summary="A pure-white monochrome design system for software, writing and photography. The ground is paper-white, the mark is near-black, and the only chroma left in the file is status — which is bound to state and never to brand."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild>
            <Link href="/components/">Browse components</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/principles/">Read the principles</Link>
          </Button>
          <StatusPill>{COMPONENTS.length} components</StatusPill>
        </div>
      </PageIntro>

      <FigureBand
        label="The system in numbers"
        scale="sub"
        figures={[
          { id: 'components', label: 'Components', value: String(COMPONENTS.length) },
          { id: 'tokens', label: 'Tokens', value: String(tokenCount()), note: 'light and dark' },
          { id: 'radius', label: 'Radius steps', value: '4', note: 'and there is no fifth' },
          { id: 'shadow', label: 'Blurred shadows', value: '0', note: 'depth is a hairline' },
        ]}
      />

      <section className="flex flex-col gap-5">
        <SectionHeading id="install">Install</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="flex flex-col gap-4">
            <CodeBlock html={snippet('install')} source={snippetSource('install')} />
            <p className="m-0 text-sm leading-relaxed text-(--ink-3-aa)">
              Six runtime dependencies — Radix for the behaviour nobody should re-implement,
              cmdk for the combobox pattern, react-day-picker for the calendar, lucide for icons,
              sonner for toasts, and clsx + tailwind-merge to resolve a class conflict in the
              caller’s favour. No router, no state library, no CSS-in-JS.
            </p>
          </div>
          <CodeBlock html={snippet('usage')} source={snippetSource('usage')} />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="foundations">Foundations</SectionHeading>
        <div className="grid gap-px overflow-hidden rounded-(--radius-lg) border border-(--rule) bg-(--rule) sm:grid-cols-2">
          {FOUNDATIONS.map((page) => (
            <Link
              key={page.slug}
              href={`/foundations/${page.slug}/`}
              className="group flex flex-col gap-2 bg-(--paper) p-6 transition-colors duration-(--duration-fast) hover:bg-(--paper-2)"
            >
              <span className="font-heading text-[length:var(--fs-item)] text-(--ink)">
                {page.title}
              </span>
              <span className="text-[13px] leading-relaxed text-(--ink-3-aa)">{page.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="components">Components</SectionHeading>
        <div className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
          {groups.map((section) => (
            <div
              key={section.group}
              className="grid gap-4 py-6 md:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <p className="m-0 eyebrow text-(--ink-3-aa)">{section.group}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {section.entries.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/components/${entry.slug}/`}
                    className="text-sm text-(--ink-2) underline decoration-transparent underline-offset-4 transition-colors duration-(--duration-fast) hover:text-(--ink) hover:decoration-(--rule-2)"
                  >
                    {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionHeading id="tailwind">Already using Tailwind?</SectionHeading>
        <p className="m-0 max-w-(--w-reading) text-sm leading-relaxed text-(--ink-2)">
          Take the portable token layers on their own and skip the second copy of the utilities. The
          mode is an attribute on <code className="font-mono text-xs">&lt;html&gt;</code>, so it can
          be written before the first paint and never flashes the wrong theme.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock html={snippet('tailwind')} source={snippetSource('tailwind')} />
          <div className="flex flex-col gap-4">
            <CodeBlock html={snippet('theme')} source={snippetSource('theme')} />
            <CodeBlock html={snippet('override')} source={snippetSource('override')} />
          </div>
        </div>
      </section>
    </div>
  )
}
