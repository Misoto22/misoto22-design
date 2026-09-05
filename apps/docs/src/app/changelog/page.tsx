import { Badge } from '@misoto22/design'
import type { Metadata } from 'next'
import { PageIntro } from '@/components/PageIntro'
import { Prose } from '@/components/Prose'
import changelog from '@/generated/changelog.json'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What changed in @misoto22/design, and why.',
}

interface Item {
  kind: 'item' | 'paragraph'
  text: string
}
interface Section {
  title: string
  items: Item[]
}
interface Release {
  version: string
  date?: string
  sections: Section[]
}

const RELEASES = changelog as Release[]

/**
 * The changelog, read from the repository's own `CHANGELOG.md`.
 *
 * Not a second hand-kept "what's new" list. The file that ships with the
 * package and the page a reader lands on are the same words — which is the only
 * arrangement where they cannot disagree, and disagreeing is what a
 * documentation changelog does within two releases.
 */
export default function Changelog() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <PageIntro
        eyebrow="Start"
        title="Changelog"
        summary="Every consumer-visible change ships with a changeset, so these words were written by whoever made the change at the moment they understood it — not reconstructed from commit subjects a month later."
        crumbs={[{ label: 'Changelog' }]}
      />

      <div className="flex flex-col divide-y divide-(--rule) border-y border-(--rule)">
        {RELEASES.map((release) => (
          <article key={release.version} className="grid gap-6 py-8 md:grid-cols-[8rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-heading text-[length:var(--fs-item)] font-normal text-(--ink)">
                {release.version}
              </h2>
              {release.date && (
                <time className="mono-meta text-(--ink-3-aa)">{release.date}</time>
              )}
            </div>

            <div className="flex flex-col gap-6">
              {release.sections.map((section, index) => (
                <section key={section.title || index} className="flex flex-col gap-3">
                  {section.title && (
                    <Badge tone="outline" className="self-start">
                      {section.title}
                    </Badge>
                  )}
                  {section.items.map((item, itemIndex) =>
                    item.kind === 'item' ? (
                      <div
                        key={itemIndex}
                        className="max-w-(--w-reading) border-s border-(--rule-2) ps-4"
                      >
                        <Prose text={item.text} small />
                      </div>
                    ) : (
                      <Prose key={itemIndex} text={item.text} />
                    ),
                  )}
                </section>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
