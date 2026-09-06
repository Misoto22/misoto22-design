'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
} from '@misoto22/design'
import { BookOpen, CircleHelp, Home, Inbox, Settings, Trash2 } from 'lucide-react'

/**
 * The rail is composed, not configured: a header, a scrolling middle and a
 * footer, and every product wants different things in all three. What the
 * component owns is the part that is the same everywhere — the width, the edge,
 * the scrolling, and what happens when it closes. Press the button in the
 * header, or Cmd+B, and watch the labels go: the rows stay reachable because
 * each one keeps its label as a tooltip rather than becoming an unnamed glyph.
 */
export function Example() {
  return (
    <SidebarProvider collapsible="icon">
      <div className="flex h-80 w-full overflow-hidden rounded-(--radius-lg) border border-(--rule)">
        <Sidebar label="Workspace" className="border-e">
          <SidebarHeader>
            <span className="truncate font-heading text-[15px] text-(--ink)">Acme</span>
            <SidebarTrigger className="ms-auto" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label="Workspace" count={3}>
              <SidebarItem href="#home" icon={Home} active>
                Home
              </SidebarItem>
              <SidebarItem href="#inbox" icon={Inbox} trailing="12">
                Inbox
              </SidebarItem>
              <SidebarItem href="#library" icon={BookOpen}>
                Library
              </SidebarItem>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarItem href="#settings" icon={Settings}>
              Settings
            </SidebarItem>
            <SidebarItem href="#help" icon={CircleHelp}>
              Help
            </SidebarItem>
            <SidebarItem href="#trash" icon={Trash2}>
              Trash
            </SidebarItem>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-6 text-sm text-(--ink-3-aa)">The page, beside the rail.</div>
      </div>
    </SidebarProvider>
  )
}
