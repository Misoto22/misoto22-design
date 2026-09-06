'use client'

import { AppShell, NavItem, Separator, Text } from '@misoto22/design'
import {
  Activity,
  Boxes,
  Database,
  FileText,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  Mail,
  Server,
  Settings,
  Shield,
  Terminal,
  Users,
} from 'lucide-react'

const SECTIONS = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: Activity, label: 'Metrics' },
  { icon: Server, label: 'Hosts' },
  { icon: Boxes, label: 'Services' },
  { icon: GitBranch, label: 'Deploys' },
  { icon: Database, label: 'Databases' },
  { icon: Globe, label: 'Domains' },
  { icon: Mail, label: 'Mail' },
  { icon: Terminal, label: 'Logs' },
  { icon: FileText, label: 'Reports' },
  { icon: Users, label: 'Members' },
  { icon: KeyRound, label: 'API keys' },
  { icon: Shield, label: 'Audit trail' },
  { icon: Settings, label: 'Settings' },
]

/**
 * Fourteen rows in a 15rem column, and the brand still on screen. Put the whole
 * list in the sidebar prop and let the component's own nav scroll it: build the
 * column yourself, with the brand inside the scrolling part, and the first
 * thing a long list does is carry the brand off the top. The nav is the only
 * part that moves, with the slim scrollbar, while the brand row and its hairline
 * stay put. Scroll the list below to see it.
 */
export function Example() {
  return (
    <div className="h-96 w-full overflow-hidden rounded-(--radius) border border-(--rule) [&_[class*=min-h-svh]]:min-h-0">
      <AppShell
        contentAs="div"
        sidebarLabel="Fleet sidebar"
        navLabel="Fleet navigation"
        brand={<span className="font-heading text-base">Fleet</span>}
        sidebar={
          <>
            {SECTIONS.map((section) => (
              <NavItem key={section.label} href="#" icon={section.icon} active={section.label === 'Deploys'}>
                {section.label}
              </NavItem>
            ))}
            <Separator className="my-2" />
            <NavItem href="#">Documentation</NavItem>
          </>
        }
      >
        <Text>
          The sidebar scrolls on its own. The brand row above it does not, and
          neither does the topbar — which is rendered here even though nothing
          was passed to it.
        </Text>
      </AppShell>
    </div>
  )
}
