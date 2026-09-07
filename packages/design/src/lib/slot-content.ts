import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

/** Resolve suspended server elements through React's public children API. */
export function resolveSlotElement<Props>(element: ReactElement<Props>): ReactElement<Props> {
  const children = Children.toArray(element)
  const resolved = children[0]
  if (children.length !== 1 || !isValidElement<Props>(resolved)) {
    throw new Error('A slot must resolve to exactly one React element.')
  }
  return resolved
}

/** Replace a host slot's content after resolving its element; retain navigation props. */
export function replaceSlotContent<Props>(element: ReactElement<Props>, content: ReactNode): ReactElement<Props> {
  return cloneElement(resolveSlotElement(element), undefined, content)
}
