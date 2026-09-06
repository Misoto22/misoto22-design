import type { HTMLAttributes } from 'react'

export interface ArticleProps extends HTMLAttributes<HTMLElement> {
  /**
   * Rendered HTML from a Markdown or MDX pipeline.
   *
   * Trusted markup only. This sets `dangerouslySetInnerHTML`, so it must come
   * from content you control — a repository's own posts, a CMS you author —
   * and never from a reader. Untrusted Markdown has to be sanitised before it
   * reaches here; that is a pipeline decision, not a component one, and a
   * sanitiser bolted on inside a styling primitive would be the wrong place to
   * make it and the easiest place to get it wrong.
   */
  html?: string
  /** The element to render. `article` by default; pass `div` for a fragment. */
  as?: 'article' | 'div' | 'section'
}

/**
 * The long-form reading surface.
 *
 * Everything a Markdown pipeline can emit — headings, prose, lists, tables,
 * quotations, code, figures, footnotes, MathML — set in this system's type,
 * colour and rules. The styles live in `article.css` rather than in a class
 * string, because the input is not JSX: there is no component to hang a class
 * on when the markup arrived as a string, so the contract has to be the element
 * names themselves.
 *
 * That file is published on its own as `@misoto22/design/article.css`, so a
 * site with its own Markdown pipeline can take the reading surface without
 * taking the components — which is the case this exists for. Three sites
 * hand-rolling a prose stylesheet is three prose stylesheets that drift.
 *
 * Composable either way: pass `html` for a rendered string, or children for
 * real elements. A post that mixes the two — prose with a `Diagram` dropped
 * into the middle — renders its blocks in order and gives each one an
 * `Article`. Inside one, these rules BEAT a component's utilities:
 * `article.css` is imported unlayered while Tailwind's utilities sit in
 * `@layer utilities`, and an unlayered rule wins over a layered one whatever
 * either one's specificity is. That is the mechanism rather than an accident —
 * it is what lets a `Markdown` paragraph, a `Text` carrying `m-0`, give its
 * margin up to the article's rhythm. A component that has to hold a property
 * inside an article needs an inline style, not a class.
 *
 * @example
 * <Article html={renderedMarkdown} />
 * @example
 * <Article>
 *   <h1>The White Reset</h1>
 *   <p className="lead">A monochrome system for software and writing.</p>
 *   <Diagram spec={spec} />
 * </Article>
 */
export function Article({ html, as: Comp = 'article', className, children, ...rest }: ArticleProps) {
  // One or the other, never both. The rhythm rules are child combinators, so a
  // wrapper around the rendered string — even a `display: contents` one, which
  // removes the box but not the DOM node — would take every heading and
  // paragraph out of the article's direct children and cost them their
  // spacing. A page with both is a page with two Articles, and it should say
  // so.
  if (html !== undefined) {
    return (
      <Comp
        data-m22-article
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
        {...rest}
      />
    )
  }

  return (
    <Comp data-m22-article className={className} {...rest}>
      {children}
    </Comp>
  )
}

export default Article
