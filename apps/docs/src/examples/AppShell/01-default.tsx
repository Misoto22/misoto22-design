'use client'

import { AppShell, Card, CardBody, CardTitle, NavItem } from '@misoto22/design'
import { Component, Home, Settings } from 'lucide-react'

export function Example() {
  // Boxed so the shell's own full-height layout stays inside the frame.
  return (
    <div className="h-96 w-full overflow-hidden rounded-(--radius) border border-(--rule) [&_[class*=min-h-svh]]:min-h-0">
      <AppShell
        // A page may have only one <main>, and this preview sits inside the
        // documentation site's own.
        contentAs="div"
        // The documentation site has a sidebar of its own, and two
        // complementary landmarks with one name cannot be told apart.
        sidebarLabel="Console sidebar"
        navLabel="Console navigation"
        brand={<span className="font-heading text-base">Console</span>}
        sidebar={
          <>
            <NavItem href="#" icon={Home} active>Overview</NavItem>
            <NavItem href="#" icon={Component}>Components</NavItem>
            <NavItem href="#" icon={Settings}>Settings</NavItem>
          </>
        }
        topbar={<span className="mono-meta text-(--ink-3-aa)">production</span>}
      >
        <Card>
          <CardBody>
            <CardTitle>Content well</CardTitle>
          </CardBody>
        </Card>
      </AppShell>
    </div>
  )
}
