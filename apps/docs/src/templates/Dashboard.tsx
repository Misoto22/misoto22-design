'use client'

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FigureBand,
  NavItem,
  Progress,
  Select,
  SelectItem,
  StatusPill,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from '@misoto22/design'
import { Activity, Boxes, Home, Settings } from 'lucide-react'
import { useState } from 'react'

const DEPLOYS = [
  { sha: 'a1b2c3d', branch: 'main', duration: '2m 14s', state: 'passed' as const },
  { sha: '9f8e7d6', branch: 'codex/ui-library', duration: '2m 41s', state: 'passed' as const },
  { sha: '4c5b6a7', branch: 'codex/photo-cache', duration: '1m 02s', state: 'failed' as const },
  { sha: '77aa2b1', branch: 'main', duration: '2m 20s', state: 'passed' as const },
]

/**
 * A console, assembled from the set.
 *
 * The point of a template is not the layout — it is showing which components a
 * real screen actually needs together, and how they space against each other
 * once there are twelve of them rather than one. A gallery answers "what does a
 * Table look like"; this answers "what does a Table look like beside a figure
 * band, under a tab strip, in a column that has to hold a sidebar".
 *
 * Every element here is from the package. Nothing was styled specially for the
 * template, which is the only way it stays honest as the system changes.
 */
export function Dashboard() {
  const [range, setRange] = useState('30')

  return (
    <div className="grid min-h-[36rem] grid-cols-1 md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden flex-col gap-1 border-e border-(--rule) p-3 md:flex">
        <div className="flex items-center gap-2 px-3 pb-3">
          <Avatar alt="" fallback="M" size="sm" />
          <span className="font-heading text-[15px] text-(--ink)">Console</span>
        </div>
        <NavItem href="#overview" icon={Home} active>
          Overview
        </NavItem>
        <NavItem href="#deploys" icon={Boxes}>
          Deploys
        </NavItem>
        <NavItem href="#activity" icon={Activity}>
          Activity
        </NavItem>
        <NavItem href="#settings" icon={Settings}>
          Settings
        </NavItem>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--rule) px-5 py-3">
          <StatusPill>All systems normal</StatusPill>
          <div className="flex items-center gap-2">
            <Select label="Range" value={range} onValueChange={setRange} className="w-36">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </Select>
            <Button size="sm">Deploy</Button>
          </div>
        </header>

        <div className="flex flex-col gap-6 p-5">
          <FigureBand
            label="At a glance"
            scale="sub"
            figures={[
              { id: 'releases', label: 'Releases', value: '12', note: `last ${range} days` },
              { id: 'duration', label: 'Median build', value: '2m 14s', note: 'down from 3m 40s' },
              { id: 'rollbacks', label: 'Rollbacks', value: '0' },
              { id: 'uptime', label: 'Uptime', value: '99.98%', note: 'measured at the edge' },
            ]}
          />

          <Tabs defaultValue="deploys">
            <TabsList>
              <TabsTrigger value="deploys">Deploys</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="deploys" className="flex flex-col gap-4">
              <ToggleGroup type="single" defaultValue="all" aria-label="Filter">
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="passed">Passed</ToggleGroupItem>
                <ToggleGroupItem value="failed">Failed</ToggleGroupItem>
              </ToggleGroup>

              <Table caption="Recent deploys">
                <THead>
                  <TR>
                    <TH>Commit</TH>
                    <TH>Branch</TH>
                    <TH className="text-end">Duration</TH>
                    <TH>State</TH>
                  </TR>
                </THead>
                <TBody>
                  {DEPLOYS.map((deploy) => (
                    <TR key={deploy.sha}>
                      <TD className="font-mono text-xs">{deploy.sha}</TD>
                      <TD>{deploy.branch}</TD>
                      <TD className="text-end tabular-nums">{deploy.duration}</TD>
                      <TD>
                        <Badge tone={deploy.state === 'passed' ? 'success' : 'danger'}>
                          {deploy.state}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Reindex</CardTitle>
                    <Badge tone="warning">running</Badge>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4">
                    <Progress value={62} label="Reindexing documents" showValue />
                    <p className="m-0 text-[13px] text-(--ink-3-aa)">
                      44,102 of 71,300 documents. Started 6 minutes ago.
                    </p>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Thumbnails</CardTitle>
                    <Badge tone="success">idle</Badge>
                  </CardHeader>
                  <CardBody className="flex flex-col gap-4">
                    <Progress label="Waiting for work" />
                    <p className="m-0 text-[13px] text-(--ink-3-aa)">
                      Nothing queued. Last run finished 2 hours ago.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
