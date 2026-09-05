import { ERROR_ACTION_CLASS, ErrorState } from '@misoto22/design'

export function Example() {
  return (
    <ErrorState
      className="min-h-0 pt-0"
      code="404"
      heading="Page not found"
      message="The page you're looking for has moved, or never existed."
      action={<a href="/" className={ERROR_ACTION_CLASS}>Back home</a>}
    />
  )
}
