import type { ReactElement } from 'react'
import {
  AreaChart,
  BarChart,
  BarList,
  BigNumber,
  BoxPlot,
  BulletChart,
  Facet,
  Histogram,
  WaterfallChart,
  ComposedChart,
  FunnelChart,
  Heatmap,
  LineChart,
  PieChart,
  RadarChart,
  RadialChart,
  SankeyChart,
  ScatterChart,
  Sparkline,
  TreemapChart,
} from '../index'
import type { ChartConfig } from '../index'

/**
 * One representative render per chart, in the shape a real call site would use
 * — a title, an axis, a tooltip, a legend and at least one mark.
 *
 * The same argument as `src/__tests__/surface.tsx`: one fixture shared by the
 * axe pass, the server-render pass and the coverage gate, so "every chart is
 * checked" is a property the repository enforces rather than a claim.
 *
 * What this fixture CANNOT check is anything that needs layout. jsdom has none,
 * so the plot renders at `initialDimension` and the marks' geometry is
 * meaningless here. Every visual assertion belongs in the browser suite.
 */
export interface ChartSurfaceEntry {
  /** The directory under src/charts. Keyed to the coverage check. */
  dir: string
  render: () => ReactElement
  /**
   * The same chart with nothing to draw.
   *
   * Required, and required because seven of the twenty shipped without an empty
   * state at all: zero rows drew a named figure over a blank box, and the
   * hidden table renders nothing below one row, so the picture and its text
   * equivalent went silent together. "No data" and "failed to load" then look
   * the same to the reader, and reloading does not help.
   *
   * A new chart cannot be added without answering this, which is the point —
   * the gap was never one author forgetting, it was each chart being written
   * without the one before it in view.
   */
  renderEmpty: () => ReactElement
}

const series = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
} satisfies ChartConfig

const rows = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 273, mobile: 190 },
]

const browsers = {
  chrome: { label: 'Chrome' },
  safari: { label: 'Safari' },
  firefox: { label: 'Firefox' },
} satisfies ChartConfig

const browserRows = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
]

const skills = {
  current: { label: 'Current' },
} satisfies ChartConfig

const skillRows = [
  { skill: 'Design', current: 86 },
  { skill: 'Research', current: 64 },
  { skill: 'Writing', current: 72 },
  { skill: 'Delivery', current: 91 },
]

const flow = {
  Visits: { label: 'Visits' },
  Signup: { label: 'Signup' },
  Churn: { label: 'Churn' },
} satisfies ChartConfig

const flowData = {
  nodes: [{ name: 'Visits' }, { name: 'Signup' }, { name: 'Churn' }],
  links: [
    { source: 0, target: 1, value: 60 },
    { source: 0, target: 2, value: 40 },
  ],
}


const scatterA = [
  { kb: 120, ms: 340 },
  { kb: 180, ms: 410 },
  { kb: 240, ms: 520 },
  { kb: 300, ms: 610 },
]

const stages = [
  { stage: 'Visited', people: 4200 },
  { stage: 'Signed up', people: 1800 },
  { stage: 'Activated', people: 900 },
  { stage: 'Paid', people: 320 },
]

const stageConfig = {
  Visited: { label: 'Visited' },
  'Signed up': { label: 'Signed up' },
  Activated: { label: 'Activated' },
  Paid: { label: 'Paid' },
} satisfies ChartConfig

const packages = [
  { name: 'recharts', size: 480 },
  { name: 'react-dom', size: 310 },
  { name: 'motion', size: 140 },
  { name: 'lucide', size: 90 },
]

const HOURS = ['00', '06', '12', '18']
const DAYS = ['Mon', 'Tue', 'Wed']
const heat = DAYS.flatMap((row, y) =>
  HOURS.map((column, x) => ({ row, column, value: (x + 1) * (y + 2) })),
)

const latency = [
  { name: 'Sydney', values: [182, 190, 194, 201, 205, 209, 214, 221, 236, 402] },
  { name: 'Frankfurt', values: [310, 318, 325, 331, 338, 344, 352, 361, 379, 588] },
]

const samples = [12, 18, 19, 21, 22, 24, 25, 25, 27, 29, 31, 34, 38, 44, 61]

const targets = [
  { name: 'Revenue', value: 72, target: 85 },
  { name: 'Retention', value: 91, target: 88 },
]

const bridge = [
  { name: 'FY24', type: 'total' as const, value: 4200 },
  { name: 'New', value: 1400 },
  { name: 'Churn', value: -620 },
  { name: 'FY25', type: 'total' as const },
]

const facetRows = [
  { month: 'Jan', channel: 'Organic', visitors: 300 },
  { month: 'Feb', channel: 'Organic', visitors: 200 },
  { month: 'Jan', channel: 'Paid', visitors: 50 },
  { month: 'Feb', channel: 'Paid', visitors: 90 },
]

export const CHART_SURFACE: ChartSurfaceEntry[] = [
  {
    dir: 'AreaChart',
    render: () => (
      <AreaChart title="Visitors per month" config={series} data={rows} xDataKey="month">
        <AreaChart.Grid />
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.YAxis />
        <AreaChart.Tooltip />
        <AreaChart.Legend />
        <AreaChart.Area dataKey="desktop" variant="gradient">
          <AreaChart.Dot variant="border" />
          <AreaChart.ActiveDot />
        </AreaChart.Area>
        <AreaChart.Area dataKey="mobile" variant="hatched" />
      </AreaChart>
    ),
    renderEmpty: () => (
      <AreaChart title="Visitors per month" config={series} data={[]} xDataKey="month">
        <AreaChart.XAxis dataKey="month" />
        <AreaChart.Area dataKey="desktop" />
      </AreaChart>
    ),
  },
  {
    dir: 'BarChart',
    render: () => (
      <BarChart title="Visitors by month" config={series} data={rows} xDataKey="month">
        <BarChart.Grid />
        <BarChart.XAxis dataKey="month" />
        <BarChart.Tooltip />
        <BarChart.Legend isClickable />
        <BarChart.Bar dataKey="desktop" variant="duotone" />
        <BarChart.Bar dataKey="mobile" variant="hatched" />
      </BarChart>
    ),
    renderEmpty: () => (
      <BarChart title="Visitors by month" config={series} data={[]} xDataKey="month">
        <BarChart.XAxis dataKey="month" />
        <BarChart.Bar dataKey="desktop" />
      </BarChart>
    ),
  },
  {
    dir: 'LineChart',
    render: () => (
      <LineChart title="Visitors per month" config={series} data={rows} xDataKey="month">
        <LineChart.Grid />
        <LineChart.XAxis dataKey="month" />
        <LineChart.Tooltip />
        <LineChart.Legend />
        <LineChart.Line dataKey="desktop">
          <LineChart.Dot />
        </LineChart.Line>
        <LineChart.Line dataKey="mobile" strokeVariant="dashed" />
      </LineChart>
    ),
    renderEmpty: () => (
      <LineChart title="Visitors per month" config={series} data={[]} xDataKey="month">
        <LineChart.XAxis dataKey="month" />
        <LineChart.Line dataKey="desktop" />
      </LineChart>
    ),
  },
  {
    dir: 'ComposedChart',
    render: () => (
      <ComposedChart title="Visitors and sessions" config={series} data={rows} xDataKey="month">
        <ComposedChart.Grid />
        <ComposedChart.XAxis dataKey="month" />
        <ComposedChart.Tooltip />
        <ComposedChart.Legend />
        <ComposedChart.Bar dataKey="desktop" variant="gradient" />
        <ComposedChart.Line dataKey="mobile" />
      </ComposedChart>
    ),
    renderEmpty: () => (
      <ComposedChart title="Visitors and sessions" config={series} data={[]} xDataKey="month">
        <ComposedChart.XAxis dataKey="month" />
        <ComposedChart.Bar dataKey="desktop" />
      </ComposedChart>
    ),
  },
  {
    dir: 'PieChart',
    render: () => (
      <PieChart
        title="Visitors by browser"
        config={browsers}
        data={browserRows}
        dataKey="visitors"
        nameKey="browser"
      >
        <PieChart.Pie innerRadius="55%" />
        <PieChart.Tooltip />
        <PieChart.Legend />
      </PieChart>
    ),
    renderEmpty: () => (
      <PieChart
        title="Visitors by browser"
        config={browsers}
        data={[]}
        dataKey="visitors"
        nameKey="browser"
      >
        <PieChart.Pie />
      </PieChart>
    ),
  },
  {
    dir: 'RadarChart',
    render: () => (
      <RadarChart title="Team profile" config={skills} data={skillRows} angleDataKey="skill">
        <RadarChart.PolarGrid />
        <RadarChart.PolarAngleAxis dataKey="skill" />
        <RadarChart.Tooltip />
        <RadarChart.Radar dataKey="current" />
      </RadarChart>
    ),
    renderEmpty: () => (
      <RadarChart title="Team profile" config={skills} data={[]} angleDataKey="skill">
        <RadarChart.Radar dataKey="current" />
      </RadarChart>
    ),
  },
  {
    dir: 'RadialChart',
    render: () => (
      <RadialChart
        title="Visitors by browser"
        config={browsers}
        data={browserRows}
        nameKey="browser"
        valueKey="visitors"
      >
        <RadialChart.RadialBar dataKey="visitors" />
        <RadialChart.Tooltip />
        <RadialChart.Legend />
      </RadialChart>
    ),
    renderEmpty: () => (
      <RadialChart title="Visitors by browser" config={browsers} data={[]} nameKey="browser">
        <RadialChart.RadialBar dataKey="visitors" />
      </RadialChart>
    ),
  },
  {
    dir: 'SankeyChart',
    render: () => (
      <SankeyChart title="Visits by outcome" config={flow} data={flowData}>
        <SankeyChart.Node radius={2}>
          <SankeyChart.NodeLabel position="outside" showValues />
        </SankeyChart.Node>
        <SankeyChart.Link variant="gradient" />
        <SankeyChart.Tooltip />
      </SankeyChart>
    ),
    renderEmpty: () => (
      <SankeyChart title="Visits by outcome" config={flow} data={{ nodes: [], links: [] }}>
        <SankeyChart.Node />
      </SankeyChart>
    ),
  },
  {
    dir: 'ScatterChart',
    render: () => (
      <ScatterChart
        title="Load time against bundle size"
        config={{ desktop: { label: 'Desktop' } }}
        table={{
          rows: scatterA,
          rowKey: 'kb',
          columns: [{ key: 'ms', label: 'Load (ms)' }],
        }}
      >
        <ScatterChart.Grid />
        <ScatterChart.XAxis dataKey="kb" name="Bundle" unit=" kB" />
        <ScatterChart.YAxis dataKey="ms" name="Load" unit=" ms" />
        <ScatterChart.Tooltip />
        <ScatterChart.Scatter dataKey="desktop" data={scatterA} />
      </ScatterChart>
    ),
    renderEmpty: () => (
      <ScatterChart
        title="Load time against bundle size"
        config={{ desktop: { label: 'Desktop' } }}
        table={{ rows: [], rowKey: 'kb', columns: [{ key: 'ms', label: 'Load (ms)' }] }}
      >
        <ScatterChart.XAxis dataKey="kb" />
        <ScatterChart.YAxis dataKey="ms" />
      </ScatterChart>
    ),
  },
  {
    dir: 'FunnelChart',
    render: () => (
      <FunnelChart
        title="Signup funnel"
        config={stageConfig}
        data={stages}
        dataKey="people"
        nameKey="stage"
      >
        <FunnelChart.Funnel>
          <FunnelChart.Label />
        </FunnelChart.Funnel>
        <FunnelChart.Tooltip />
      </FunnelChart>
    ),
    renderEmpty: () => (
      <FunnelChart
        title="Signup funnel"
        config={stageConfig}
        data={[]}
        dataKey="people"
        nameKey="stage"
      >
        <FunnelChart.Funnel />
      </FunnelChart>
    ),
  },
  {
    dir: 'TreemapChart',
    render: () => (
      <TreemapChart title="Bundle size by package" data={packages}>
        <TreemapChart.Tooltip />
      </TreemapChart>
    ),
    renderEmpty: () => (
      <TreemapChart title="Bundle size by package" data={[]}>
        <TreemapChart.Tooltip />
      </TreemapChart>
    ),
  },
  {
    dir: 'Heatmap',
    render: () => (
      <Heatmap title="Commits by weekday and hour" columns={HOURS} rows={DAYS} cells={heat} />
    ),
    renderEmpty: () => (
      <Heatmap title="Commits by weekday and hour" columns={[]} rows={[]} cells={[]} />
    ),
  },
  {
    dir: 'Sparkline',
    render: () => <Sparkline label="Weekly signups" data={[12, 18, 9, 24, 30, 22, 41]} value="41" />,
    renderEmpty: () => (
      <Sparkline label="Weekly signups" data={[]} />
    ),
  },
  {
    dir: 'BarList',
    render: () => (
      <BarList
        label="Top referrers"
        items={[
          { name: 'google.com', value: 4210 },
          { name: 'github.com', value: 1880 },
          { name: 'news.ycombinator.com', value: 940 },
        ]}
      />
    ),
    renderEmpty: () => (
      <BarList label="Top referrers" items={[]} />
    ),
  },
  {
    dir: 'BigNumber',
    render: () => (
      <BigNumber
        label="Monthly revenue"
        value="$48,210"
        delta={{ value: 0.124, label: 'vs last month', intent: 'up-is-good' }}
      />
    ),
    renderEmpty: () => (
      <BigNumber label="Monthly revenue" value={null} />
    ),
  },
  {
    dir: 'BoxPlot',
    render: () => (
      <BoxPlot title="Response time by region" data={latency}>
        <BoxPlot.Grid />
        <BoxPlot.XAxis />
        <BoxPlot.YAxis label="ms" />
        <BoxPlot.Tooltip />
        <BoxPlot.Boxes />
      </BoxPlot>
    ),
    renderEmpty: () => (
      <BoxPlot title="Response time by region" data={[]}>
        <BoxPlot.Boxes />
      </BoxPlot>
    ),
  },
  {
    dir: 'Histogram',
    render: () => (
      <Histogram title="Request duration" values={samples}>
        <Histogram.Grid />
        <Histogram.XAxis label="ms" />
        <Histogram.YAxis />
        <Histogram.Tooltip />
        <Histogram.Bars />
      </Histogram>
    ),
    renderEmpty: () => (
      <Histogram title="Request duration" values={[]}>
        <Histogram.Bars />
      </Histogram>
    ),
  },
  {
    dir: 'BulletChart',
    render: () => (
      <BulletChart title="Quarterly targets" data={targets} ranges={[50, 80]} domain={[0, 100]} />
    ),
    renderEmpty: () => (
      <BulletChart title="Quarterly targets" data={[]} />
    ),
  },
  {
    dir: 'WaterfallChart',
    render: () => (
      <WaterfallChart title="ARR bridge" data={bridge}>
        <WaterfallChart.Grid />
        <WaterfallChart.XAxis />
        <WaterfallChart.YAxis />
        <WaterfallChart.Tooltip />
        <WaterfallChart.Bars />
      </WaterfallChart>
    ),
    renderEmpty: () => (
      <WaterfallChart title="ARR bridge" data={[]}>
        <WaterfallChart.Bars />
      </WaterfallChart>
    ),
  },
  {
    dir: 'Facet',
    render: () => (
      <Facet
        title="Visitors by channel"
        data={facetRows}
        by="channel"
        value="visitors"
        xDataKey="month"
      >
        {(panel) => (
          <Sparkline
            label={`${panel.name} visitors`}
            data={panel.rows.map((row) => Number(row.visitors))}
            domain={panel.domain}
          />
        )}
      </Facet>
    ),
    renderEmpty: () => (
      <Facet title="Visitors by channel" data={[]} by="channel" value="visitors" xDataKey="month">
        {(panel) => <Sparkline label={panel.name} data={[]} />}
      </Facet>
    ),
  },
]

export const CHART_SURFACE_BY_DIR = new Map(CHART_SURFACE.map((entry) => [entry.dir, entry]))
