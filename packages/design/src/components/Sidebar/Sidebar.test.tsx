import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Home, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarBranch,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
} from './Sidebar'

function rail(props: Partial<React.ComponentProps<typeof SidebarProvider>> = {}) {
  return (
    <SidebarProvider {...props}>
      <Sidebar label="Documentation">
        <SidebarTrigger />
        <SidebarContent>
          <SidebarGroup label="Guide" count={2}>
            <SidebarItem href="#start" icon={Home} active>
              Getting started
            </SidebarItem>
            <SidebarItem href="#settings" icon={Settings} trailing="3">
              Settings
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

describe('Sidebar', () => {
  it('is a named landmark, because a page can have two navigations in it', () => {
    render(rail())
    expect(screen.getByRole('navigation', { name: 'Documentation' })).toBeInTheDocument()
  })

  it('marks the current row for a reader who cannot see that it is darker', () => {
    render(rail())
    expect(screen.getByRole('link', { name: 'Getting started' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('reports what the trigger will do, not what it is called', async () => {
    // A button permanently named "Toggle sidebar" tells a screen reader user
    // nothing about which way it is about to go.
    const user = userEvent.setup()
    render(rail())

    const trigger = screen.getByRole('button', { name: 'Close the sidebar' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(trigger)
    expect(screen.getByRole('button', { name: 'Open the sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('keeps every row reachable when it collapses to icons', async () => {
    // The label leaves the layout and moves into a tooltip, so it is still the
    // row's accessible name — an icon on its own is a guess for everyone and
    // nothing at all for a screen reader.
    const user = userEvent.setup()
    render(rail({ defaultOpen: false, collapsible: 'icon' }))

    expect(screen.getByRole('link', { name: 'Getting started' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open the sidebar' }))
    expect(screen.getByRole('link', { name: 'Getting started' })).toBeInTheDocument()
  })

  it('keeps the group announced when its heading is not drawn', () => {
    render(rail({ defaultOpen: false, collapsible: 'icon' }))
    expect(screen.getByRole('group', { name: 'Guide' })).toBeInTheDocument()
  })

  it('folds a group without taking its rows out of the document', async () => {
    const user = userEvent.setup()
    render(rail())

    await user.click(screen.getByRole('button', { name: /Guide/ }))
    expect(screen.getByRole('button', { name: /Guide/ })).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles on the platform shortcut, whichever modifier the keyboard has', async () => {
    const user = userEvent.setup()
    render(rail())

    await user.keyboard('{Meta>}b{/Meta}')
    expect(screen.getByRole('button', { name: 'Open the sidebar' })).toBeInTheDocument()

    await user.keyboard('{Control>}b{/Control}')
    expect(screen.getByRole('button', { name: 'Close the sidebar' })).toBeInTheDocument()
  })

  it('binds nothing when the app already owns that chord', async () => {
    const user = userEvent.setup()
    render(rail({ shortcut: null }))

    await user.keyboard('{Meta>}b{/Meta}')
    expect(screen.getByRole('button', { name: 'Close the sidebar' })).toBeInTheDocument()
  })

  it('lets a caller own the open state', async () => {
    const user = userEvent.setup()
    render(rail({ open: true }))

    // Controlled and given no handler: the rail cannot change itself.
    await user.click(screen.getByRole('button', { name: 'Close the sidebar' }))
    expect(screen.getByRole('button', { name: 'Close the sidebar' })).toBeInTheDocument()
  })
})

describe('SidebarBranch', () => {
  function tree(props: Partial<React.ComponentProps<typeof SidebarProvider>> = {}) {
    return (
      <SidebarProvider {...props}>
        <Sidebar label="Workspace">
          <SidebarContent>
            <SidebarGroup label="Teamspaces" count={1} badge={<span>Beta</span>}>
              <SidebarBranch label="Acme HQ" icon={Home}>
                <SidebarItem href="#hq" icon={Home}>
                  Overview
                </SidebarItem>
              </SidebarBranch>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )
  }

  it('opens onto its children, and says whether it is open', async () => {
    const user = userEvent.setup()
    render(tree())

    const branch = screen.getByRole('button', { name: 'Acme HQ' })
    expect(branch).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Overview' })).toBeNull()

    await user.click(branch)
    expect(branch).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument()
  })

  it('is a place with an icon, collapsed to that icon and no children', () => {
    // A nested icon under an unnested one is two glyphs with no visible
    // relationship, so the contents are a level the width no longer has.
    render(tree({ defaultOpen: false, collapsible: 'icon' }))
    expect(screen.getByRole('button', { name: 'Acme HQ' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Overview' })).toBeNull()
  })

  it('carries a group badge beside the words it qualifies', () => {
    render(tree())
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})
