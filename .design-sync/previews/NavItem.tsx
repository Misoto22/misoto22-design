import { NavItem } from '@misoto22/design'
import { LayoutDashboard, FileText, Image, Settings } from 'lucide-react'

export function ActiveAndDefault() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 220 }}>
      <NavItem href="#" icon={LayoutDashboard} active>
        Dashboard
      </NavItem>
      <NavItem href="#" icon={FileText}>
        Posts
      </NavItem>
      <NavItem href="#" icon={Image}>
        Media
      </NavItem>
      <NavItem href="#" icon={Settings}>
        Settings
      </NavItem>
    </nav>
  )
}
