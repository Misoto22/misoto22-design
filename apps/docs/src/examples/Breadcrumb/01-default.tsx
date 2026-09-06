import { Breadcrumb } from '@misoto22/design'

export function Example() {
  return (
    // Named, because the page that documents this component has a breadcrumb
    // of its own and two landmarks with one name cannot be told apart.
    <Breadcrumb
      label="Example trail"
      items={[
        { label: 'Home', href: '/' },
        { label: 'Components', href: '/components' },
        { label: 'Breadcrumb' },
      ]}
    />
  )
}
