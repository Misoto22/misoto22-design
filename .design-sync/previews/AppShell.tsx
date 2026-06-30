import { AppShell, NavItem, Button, Card, CardBody } from '@misoto22/design'
import { LayoutDashboard, FileText, Image, Settings } from 'lucide-react'

export function Dashboard() {
  return (
    <AppShell
      brand={<strong style={{ fontFamily: 'var(--font-heading)' }}>misoto22</strong>}
      sidebar={
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem href="#" icon={LayoutDashboard}>
            Dashboard
          </NavItem>
          <NavItem href="#" icon={FileText} active>
            Posts
          </NavItem>
          <NavItem href="#" icon={Image}>
            Media
          </NavItem>
          <NavItem href="#" icon={Settings}>
            Settings
          </NavItem>
        </nav>
      }
      topbar={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>POSTS</span>
          <Button>New post</Button>
        </div>
      }
    >
      <h1 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 24px' }}>Posts</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <CardBody>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: 'var(--foreground)' }}>
                  Gating private posts behind a global password
                </div>
                <div style={{ fontSize: 13, color: 'var(--secondary-text)', marginTop: 2 }}>
                  Published · 4 min read
                </div>
              </div>
              <Button variant="secondary">Edit</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: 'var(--foreground)' }}>
                  Designing a quiet editorial design system
                </div>
                <div style={{ fontSize: 13, color: 'var(--secondary-text)', marginTop: 2 }}>
                  Draft · edited 2 minutes ago
                </div>
              </div>
              <Button variant="secondary">Edit</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: 'var(--foreground)' }}>
                  Static rendering notes for the blog rebuild
                </div>
                <div style={{ fontSize: 13, color: 'var(--secondary-text)', marginTop: 2 }}>
                  Scheduled · goes live Jul 2
                </div>
              </div>
              <Button variant="secondary">Edit</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
