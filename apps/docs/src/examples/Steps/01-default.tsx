import { Steps } from '@misoto22/design'

export function Example() {
  return (
    <Steps
      label="How an answer is built"
      steps={[
        { title: 'Corpus', note: 'Blog MDX · project database · profile' },
        { title: 'Chunking', note: 'By heading · 300–800 tokens' },
        { title: 'Embedding', note: 'Voyage 3.5-lite · 1024 dimensions' },
        { title: 'Storage', note: 'pgvector — the site’s own database' },
        { title: 'Retrieval', note: 'Top 5 by cosine · 0.2 floor' },
        { title: 'Answer', note: 'Reasoning filtered · live citations', current: true },
      ]}
    />
  )
}
