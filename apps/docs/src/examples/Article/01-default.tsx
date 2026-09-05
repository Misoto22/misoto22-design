import { Article } from '@misoto22/design'

export function Example() {
  return (
    <Article>
      <h2 id="a-heading">A heading, in the editorial serif</h2>
      <p className="lead">
        The opening paragraph is marked, not guessed — a stylesheet that decides
        whatever came first is a standfirst gets it wrong the moment a post
        opens on an image.
      </p>
      <p>
        Body copy sits on the reading measure and nothing wider, with{' '}
        <a href="#a-heading">a link</a>, some <code>inline code</code> and a{' '}
        <strong>strong</strong> word in it.
      </p>
      <blockquote>
        Depth is a hairline and a change of ground, never a blur.
        <cite>The White Reset, law 2</cite>
      </blockquote>
      <ul>
        <li>The list marker is a hairline dash, not a filled disc.</li>
        <li>A filled circle in this system means a status dot.</li>
      </ul>
    </Article>
  )
}
