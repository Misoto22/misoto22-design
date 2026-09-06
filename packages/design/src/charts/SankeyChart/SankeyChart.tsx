'use client'

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Layer,
  Sankey as RechartsSankey,
  type SankeyData,
  type SankeyLinkProps,
  type SankeyNodeProps,
  type SankeyProps,
} from 'recharts'
import { motion, useReducedMotion } from 'motion/react'
import { ChartContainer, colorStops, cssName, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { type ChartEmptyProps } from '../lib/empty'
import { useChartSelection } from '../lib/selection'
import { ChartBackground, type ChartBackgroundVariant } from '../lib/background'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import { LoadingIndicator } from '../lib/loading'
import { ColorStops } from '../lib/paint'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/** One full skeleton pulse, in seconds. */
const LOADING_PULSE = 2

/**
 * How a flow band is coloured.
 *
 * `gradient` fades from the source's colour to the target's, which is the one
 * that actually reads as flow. `source` and `target` attribute the whole band
 * to one end — useful when the question is "where did this come from" rather
 * than "what became of it". `solid` gives up colour entirely and lets the
 * node rectangles carry identity.
 */
export type SankeyLinkVariant = 'gradient' | 'solid' | 'source' | 'target'

/** Where a node's label sits. */
export type SankeyLabelPosition = 'inside' | 'outside'

interface SankeyChartContextValue {
  data: SankeyData
  config: ChartConfig
  chartId: string
  isLoading: boolean
  selectedNode: string | null
  selectNode: (name: string | null) => void
}

const SankeyChartContext = createContext<SankeyChartContextValue | null>(null)

function useSankeyChart(): SankeyChartContextValue {
  const context = useContext(SankeyChartContext)
  if (!context) throw new Error('A sankey chart part must be rendered inside <SankeyChart>')
  return context
}

export interface SankeyChartProps {
  /** The nodes and the links between them, in Recharts' own shape. */
  data: SankeyData
  /** Node names → their label and paint. */
  config: ChartConfig
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /**
   * The composed parts — axes, grid, tooltip, legend, and the marks
   * themselves.
   */
  children: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  /** Escape hatch onto the raw Recharts Sankey element. */
  sankeyProps?: Omit<SankeyProps, 'data'>
  /** How wide each node rectangle is, in pixels. */
  nodeWidth?: number
  /** Vertical gap between nodes in the same column, in pixels. */
  nodePadding?: number
  /** 0 draws straight links, 1 the fullest curve. */
  linkCurvature?: number
  /** Layout passes. More is tidier and slower. */
  iterations?: number
  /** Lets the layout reorder nodes for the fewest crossings. */
  sort?: boolean
  /** How nodes are placed along the flow axis. */
  align?: 'left' | 'justify'
  /** How nodes are distributed within a column. */
  verticalAlign?: 'justify' | 'top'
  /**
   * The node lit on first render, when the chart keeps its own selection.
   * Selecting one dims every flow it does not touch.
   */
  defaultSelectedNode?: string | null
  /**
   * The selected node, driven from outside.
   *
   * Give this and the chart follows it; leave it undefined and the chart keeps
   * its own, starting from `defaultSelectedNode`.
   */
  selectedNode?: string | null
  /** Fires when the selection changes, and with null when it is cleared. */
  onSelectionChange?: (selection: { name: string; value: number } | null) => void
  /**
   * Swaps the marks for an animated skeleton, keeping the measured height so
   * the page does not jump when the data lands.
   */
  isLoading?: boolean
  /**
   * Drops the hidden table view. Only correct when the page prints the data
   * itself.
   */
  hideDataTable?: boolean
  /**
   * What the chart shows when it has nothing to draw. `false` keeps the empty
   * plot, for a chart whose emptiness is itself the reading.
   */
  empty?: ChartEmptyProps | false
}

/**
 * Where a quantity goes as it moves through stages — the shape for a funnel, a
 * budget, an energy or traffic breakdown.
 *
 * The only chart here whose data is a GRAPH rather than a table, so it takes
 * `{ nodes, links }` instead of rows, and the table view lists the flows rather
 * than the nodes.
 *
 * @example
 * <SankeyChart title="Traffic by source and outcome" config={config} data={data}>
 *   <SankeyChart.Node radius={2}>
 *     <SankeyChart.NodeLabel position="outside" showValues />
 *   </SankeyChart.Node>
 *   <SankeyChart.Link variant="gradient" />
 *   <SankeyChart.Tooltip />
 * </SankeyChart>
 */
export function SankeyChart({
  data,
  config,
  title,
  showTitle,
  description,
  children,
  className,
  sankeyProps,
  nodeWidth = 10,
  nodePadding = 10,
  linkCurvature = 0.5,
  iterations = 32,
  sort = true,
  align = 'justify',
  verticalAlign = 'justify',
  defaultSelectedNode = null,
  selectedNode: controlledNode,
  onSelectionChange,
  isLoading = false,
  hideDataTable = false,
  empty,
}: SankeyChartProps) {
  const chartId = useId().replace(/:/g, '')

  const report = useCallback(
    (name: string | null) => {
      if (!onSelectionChange) return
      onSelectionChange(name === null ? null : { name, value: nodeValue(data, name) })
    },
    [data, onSelectionChange],
  )

  const [selectedNode, selectNode] = useChartSelection(
    controlledNode,
    defaultSelectedNode,
    report,
  )

  const context = useMemo<SankeyChartContextValue>(
    () => ({ data, config, chartId, isLoading, selectedNode, selectNode }),
    [chartId, config, data, isLoading, selectNode, selectedNode],
  )

  // The flows, not the nodes: a link IS the fact a sankey states, and a table
  // of node totals would lose every "from → to" the diagram is drawn to show.
  const flows = useMemo(
    () =>
      data.links.map((link) => ({
        from: String(data.nodes[link.source]?.name ?? link.source),
        to: String(data.nodes[link.target]?.name ?? link.target),
        value: link.value,
      })),
    [data],
  )

  return (
    <SankeyChartContext.Provider value={context}>
      <ChartFigure
        title={title}
        showTitle={showTitle}
        description={description}
        className={className}
        table={
          hideDataTable
            ? false
            : {
                rows: flows,
                rowKey: 'from',
                columns: [
                  { key: 'to', label: 'To' },
                  { key: 'value', label: 'Value' },
                ],
              }
        }
        isEmpty={!isLoading && (data.nodes.length === 0 || data.links.length === 0)}
        empty={empty}
      >
        {isLoading ? (
          <div className="relative aspect-video w-full">
            <svg
              viewBox="0 0 500 250"
              preserveAspectRatio="xMidYMid meet"
              width="100%"
              height="100%"
              aria-hidden
              className="absolute inset-0 text-(--ink)"
            >
              <LoadingSankey />
            </svg>
          </div>
        ) : (
          <ChartContainer config={config}>
            <RechartsSankey
              id={chartId}
              data={data}
              nodeWidth={nodeWidth}
              nodePadding={nodePadding}
              linkCurvature={linkCurvature}
              iterations={iterations}
              sort={sort}
              align={align}
              verticalAlign={verticalAlign}
              {...resolveRenderers(children)}
              {...sankeyProps}
            >
              {children}
              <defs>
                {Object.entries(config).map(([key, series]) => (
                  <linearGradient
                    key={key}
                    id={`${chartId}-node-${cssName(key)}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <ColorStops dataKey={cssName(key)} stops={colorStops(series)} />
                  </linearGradient>
                ))}
              </defs>
            </RechartsSankey>
          </ChartContainer>
        )}
        <LoadingIndicator isLoading={isLoading} />
      </ChartFigure>
    </SankeyChartContext.Provider>
  )
}

export interface NodeProps {
  radius?: number
  isClickable?: boolean
  /** `<SankeyChart.NodeLabel>`. */
  children?: ReactNode
}

/** How the node rectangles render. A slot: the root reads it. */
const Node: FC<NodeProps> = () => null

export interface NodeLabelProps {
  position?: SankeyLabelPosition
  /** Prints each node's total flow under its name. */
  showValues?: boolean
  valueFormatter?: (value: number) => string
}

/** Labels for the nodes. A slot, composed inside `<Node>`. */
const NodeLabel: FC<NodeLabelProps> = () => null

export interface LinkProps {
  variant?: SankeyLinkVariant
  /** Thins each band where it meets a node, so neighbours stay separable. */
  verticalPadding?: number
}

/** How the flow bands render. A slot: the root reads it. */
const Link: FC<LinkProps> = () => null

/** The hover panel. No heading: the node's own name is the row label. */
function Tooltip({ variant, roundness, defaultIndex }: ChartTooltipSlotProps) {
  const { isLoading } = useSankeyChart()
  if (isLoading) return null

  return (
    <ChartTooltip
      defaultIndex={defaultIndex}
      content={
        <ChartTooltipContent nameKey="name" hideLabel roundness={roundness} variant={variant} />
      }
    />
  )
}

/** The decorative plate behind the diagram. */
function Background({ variant = 'dots' }: { variant?: ChartBackgroundVariant }) {
  const { isLoading } = useSankeyChart()
  if (isLoading) return null
  return <ChartBackground variant={variant} />
}

/** A node's total flow — outgoing, or incoming for a leaf. */
function nodeValue(data: SankeyData, name: string): number {
  const index = data.nodes.findIndex((node) => node.name === name)
  if (index === -1) return 0

  const out = data.links
    .filter((link) => link.source === index)
    .reduce((sum, link) => sum + link.value, 0)
  const incoming = data.links
    .filter((link) => link.target === index)
    .reduce((sum, link) => sum + link.value, 0)

  return out > 0 ? out : incoming
}

/** Turns the composed `<Node>` and `<Link>` slots into Recharts renderers. */
function resolveRenderers(children: ReactNode): Pick<SankeyProps, 'node' | 'link'> {
  let node: NodeProps | null = null
  let link: LinkProps | null = null

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type === Node) node = (child as ReactElement<NodeProps>).props
    if (child.type === Link) link = (child as ReactElement<LinkProps>).props
  })

  return {
    node: (props: SankeyNodeProps) => <SankeyNodeShape {...props} nodeSlot={node} />,
    link: (props: SankeyLinkProps) => <SankeyLinkShape {...props} linkSlot={link} />,
  }
}

/** Reads the `<NodeLabel>` composed inside a `<Node>`, if any. */
function resolveNodeLabel(children: ReactNode): NodeLabelProps | null {
  let label: NodeLabelProps | null = null

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === NodeLabel) {
      label = (child as ReactElement<NodeLabelProps>).props
    }
  })

  return label
}

/** Whether a node is the selected one, or one hop from it. */
function isConnected(data: SankeyData, selected: string | null, name: string): boolean {
  if (selected === null || selected === name) return true

  const selectedIndex = data.nodes.findIndex((node) => node.name === selected)
  const nodeIndex = data.nodes.findIndex((node) => node.name === name)

  return data.links.some(
    (link) =>
      (link.source === selectedIndex && link.target === nodeIndex) ||
      (link.source === nodeIndex && link.target === selectedIndex),
  )
}

/** One node rectangle, with its label and value. */
function SankeyNodeShape({
  x,
  y,
  width,
  height,
  payload,
  nodeSlot,
}: SankeyNodeProps & { nodeSlot: NodeProps | null }) {
  const { config, chartId, data, selectedNode, selectNode } = useSankeyChart()

  const radius = nodeSlot?.radius ?? 0
  const isClickable = nodeSlot?.isClickable ?? false
  const label = resolveNodeLabel(nodeSlot?.children)

  const name = payload.name
  const value = payload.value
  const icon = (payload as { icon?: ReactNode }).icon

  const dimmed = isClickable && !isConnected(data, selectedNode, name)
  const painted = name in config
  const text = config[name]?.label ?? name

  const format = label?.valueFormatter ?? ((n: number) => n.toLocaleString())
  const showValues = label?.showValues ?? false

  const centreX = x + width / 2
  const centreY = showValues ? y + height / 2 - 8 : y + height / 2
  const valueY = y + height / 2 + 8
  const outsideX = x + width + 8
  const outsideY = y + height / 2

  return (
    <Layer>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={painted ? `url(#${chartId}-node-${cssName(name)})` : 'currentColor'}
        fillOpacity={dimmed ? 0.15 : 0.9}
        className="text-(--ink) transition-opacity duration-(--duration-base)"
        style={isClickable ? { cursor: 'pointer' } : undefined}
        onClick={() => {
          if (!isClickable) return
          selectNode(selectedNode === name ? null : name)
        }}
      />
      {label?.position === 'inside' && (
        <>
          {/* A scrim inside the node, so the label reads against whatever the
              node's own gradient happens to be under it. */}
          <rect
            x={x + 1}
            y={y + 1}
            width={width - 2}
            height={height - 2}
            rx={Math.max(0, radius - 1)}
            ry={Math.max(0, radius - 1)}
            opacity={dimmed ? 0.3 : 1}
            className="fill-(--chart-surface)/60 transition-opacity duration-(--duration-base)"
            style={{ pointerEvents: 'none' }}
          />
          {icon && (
            <foreignObject
              x={centreX - 8}
              y={centreY - 30}
              width={16}
              height={16}
              opacity={dimmed ? 0.3 : 1}
              className="transition-opacity duration-(--duration-base)"
              style={{ pointerEvents: 'none' }}
            >
              <div className="flex items-center justify-center text-(--ink-2)">{icon}</div>
            </foreignObject>
          )}
          <text
            x={centreX}
            y={icon ? centreY - 4 : centreY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-(--ink) text-[10px] font-medium transition-opacity duration-(--duration-base)"
            opacity={dimmed ? 0.3 : 1}
            style={{ pointerEvents: 'none' }}
          >
            {text}
          </text>
          {showValues && (
            <text
              x={centreX}
              y={valueY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-(--ink) font-mono text-xs font-medium tabular-nums transition-opacity duration-(--duration-base)"
              opacity={dimmed ? 0.3 : 0.6}
              style={{ pointerEvents: 'none' }}
            >
              {format(value)}
            </text>
          )}
        </>
      )}
      {label?.position === 'outside' && (
        <>
          <text
            x={outsideX}
            y={outsideY - (showValues ? 8 : 0)}
            textAnchor="start"
            dominantBaseline="middle"
            className="fill-(--ink) text-xs"
            style={{ pointerEvents: 'none' }}
          >
            {text}
          </text>
          {showValues && (
            <text
              x={outsideX}
              y={outsideY + 8}
              textAnchor="start"
              dominantBaseline="middle"
              opacity={0.5}
              className="fill-(--ink) font-mono text-xs tabular-nums"
              style={{ pointerEvents: 'none' }}
            >
              {format(value)}
            </text>
          )}
        </>
      )}
    </Layer>
  )
}

/** One flow band. */
function SankeyLinkShape({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  linkWidth,
  index,
  payload,
  linkSlot,
}: SankeyLinkProps & { linkSlot: LinkProps | null }) {
  const { config, chartId, selectedNode } = useSankeyChart()

  const variant = linkSlot?.variant ?? 'gradient'
  const verticalPadding = linkSlot?.verticalPadding ?? 0

  const sourceName = payload.source.name
  const targetName = payload.target.name
  const lit =
    selectedNode === null || selectedNode === sourceName || selectedNode === targetName

  const half = Math.max(1, linkWidth - verticalPadding) / 2

  // Two mirrored cubics closed into a ribbon: the band has to be a filled shape
  // rather than a thick stroke, because its width changes along its length.
  const band = `M${sourceX},${sourceY - half}
    C${sourceControlX},${sourceY - half} ${targetControlX},${targetY - half} ${targetX},${targetY - half}
    L${targetX},${targetY + half}
    C${targetControlX},${targetY + half} ${sourceControlX},${sourceY + half} ${sourceX},${sourceY + half}
    Z`

  const sourceColor = sourceName in config ? `var(--color-${cssName(sourceName)}-0)` : 'currentColor'
  const targetColor = targetName in config ? `var(--color-${cssName(targetName)}-0)` : 'currentColor'

  return (
    <Layer className="text-(--ink)">
      <defs>
        {variant === 'gradient' && (
          <linearGradient id={`${chartId}-link-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={sourceColor} stopOpacity={0.2} />
            <stop offset="50%" stopColor={sourceColor} stopOpacity={0.5} />
            <stop offset="100%" stopColor={targetColor} stopOpacity={0.2} />
          </linearGradient>
        )}
        {/* The edge that traces a band connected to the selection. It fades out
            at both ends so it reads as a highlight rather than as an outline. */}
        <linearGradient id={`${chartId}-link-edge-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0} />
          <stop offset="15%" stopColor="var(--accent)" stopOpacity={0.8} />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity={1} />
          <stop offset="85%" stopColor="var(--accent)" stopOpacity={0.8} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={band}
        fill={linkFill(variant, chartId, index, config, sourceName, targetName)}
        // Read from the ground rather than fixed: a band at 0.4 of ink over
        // paper reads; the same 0.4 of paper-white over near-black does not.
        fillOpacity={lit ? 'calc(var(--chart-fill) * 2.6)' : 'calc(var(--chart-fill) * 0.7)'}
        stroke={selectedNode !== null && lit ? `url(#${chartId}-link-edge-${index})` : 'none'}
        strokeWidth={1}
        className="transition-opacity duration-(--duration-base)"
      />
    </Layer>
  )
}

/** The paint reference for a band, given its variant. */
function linkFill(
  variant: SankeyLinkVariant,
  chartId: string,
  index: number,
  config: ChartConfig,
  sourceName: string,
  targetName: string,
): string {
  switch (variant) {
    case 'gradient':
      return `url(#${chartId}-link-${index})`
    case 'source':
      return sourceName in config ? `url(#${chartId}-node-${cssName(sourceName)})` : 'currentColor'
    case 'target':
      return targetName in config ? `url(#${chartId}-node-${cssName(targetName)})` : 'currentColor'
    default:
      return 'currentColor'
  }
}

/** The skeleton's node columns. Fixed, so the shape reads as a sankey at once. */
const SKELETON_NODES = [
  { x: 30, y: 25, width: 12, height: 65, delay: 0 },
  { x: 30, y: 110, width: 12, height: 50, delay: 0.3 },
  { x: 30, y: 180, width: 12, height: 45, delay: 0.15 },
  { x: 244, y: 20, width: 12, height: 55, delay: 0.45 },
  { x: 244, y: 95, width: 12, height: 75, delay: 0.6 },
  { x: 244, y: 190, width: 12, height: 40, delay: 0.25 },
  { x: 458, y: 35, width: 12, height: 80, delay: 0.5 },
  { x: 458, y: 135, width: 12, height: 90, delay: 0.1 },
]

const SKELETON_LINKS = [
  { from: 0, to: 3, width: 26, delay: 0.2 },
  { from: 0, to: 4, width: 18, delay: 0.7 },
  { from: 1, to: 4, width: 24, delay: 0.4 },
  { from: 1, to: 5, width: 12, delay: 0.9 },
  { from: 2, to: 4, width: 16, delay: 0.1 },
  { from: 2, to: 5, width: 14, delay: 0.55 },
  { from: 3, to: 6, width: 22, delay: 0.35 },
  { from: 3, to: 7, width: 18, delay: 0.8 },
  { from: 4, to: 6, width: 28, delay: 0.05 },
  { from: 4, to: 7, width: 32, delay: 0.65 },
  { from: 5, to: 7, width: 16, delay: 0.45 },
]

/** A bezier from one skeleton node's right edge to another's left. */
function skeletonPath(fromIndex: number, toIndex: number): string {
  const from = SKELETON_NODES[fromIndex]!
  const to = SKELETON_NODES[toIndex]!
  const startX = from.x + from.width
  const startY = from.y + from.height / 2
  const endX = to.x
  const endY = to.y + to.height / 2
  return `M${startX},${startY} C${startX + (endX - startX) * 0.4},${startY} ${startX + (endX - startX) * 0.6},${endY} ${endX},${endY}`
}

/** The skeleton diagram: a fixed graph whose parts pulse out of phase. */
function LoadingSankey() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <>
        {SKELETON_LINKS.map((link) => (
          <path
            key={`${link.from}-${link.to}`}
            d={skeletonPath(link.from, link.to)}
            fill="none"
            stroke="currentColor"
            strokeWidth={link.width}
            opacity={0.09}
          />
        ))}
        {SKELETON_NODES.map((node) => (
          <rect
            key={`${node.x}-${node.y}`}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={2}
            fill="currentColor"
            opacity={0.25}
          />
        ))}
      </>
    )
  }

  return (
    <>
      {SKELETON_LINKS.map((link, index) => (
        <motion.path
          key={`${link.from}-${link.to}`}
          d={skeletonPath(link.from, link.to)}
          fill="none"
          stroke="currentColor"
          strokeWidth={link.width}
          initial={{ opacity: 0.04 }}
          animate={{ opacity: [0.04, 0.14, 0.04] }}
          transition={{
            duration: LOADING_PULSE * (0.8 + (index % 3) * 0.2),
            delay: link.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {SKELETON_NODES.map((node, index) => (
        <motion.rect
          key={`${node.x}-${node.y}`}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          rx={2}
          fill="currentColor"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{
            duration: LOADING_PULSE * (0.9 + (index % 4) * 0.1),
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  )
}

SankeyChart.Node = Node
SankeyChart.NodeLabel = NodeLabel
SankeyChart.Link = Link
SankeyChart.Tooltip = Tooltip
SankeyChart.Background = Background

export default SankeyChart
