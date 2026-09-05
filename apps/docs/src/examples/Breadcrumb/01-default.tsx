import { Breadcrumb } from '@misoto22/design'

export function Example() {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Components', href: '/components' },
        { label: 'Breadcrumb' },
      ]}
    />
  )
}
