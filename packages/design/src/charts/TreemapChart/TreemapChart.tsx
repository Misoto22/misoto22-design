'use client'

import { useId, type ComponentProps, type ReactNode } from 'react'
import { Treemap as RechartsTreemap } from 'recharts'
import { ChartContainer, cssName, type ChartConfig } from '../lib/chart'
import { ChartFigure } from '../lib/figure'
import { ChartTooltip, ChartTooltipContent } from '../lib/tooltip'
import type { ChartTooltipSlotProps } from '../AreaChart/AreaChart'

/**
 * How a tile is painted.
 *
 * `ramp` walks the series ramp so siblings separate by lightness; `nested`
 * darkens by DEPTH instead, which is the right encoding when the tree has more
 * than one level and the question is "what is inside what".
 */
export type TreemapVariant = 'ramp' | 'nested'

/** A node in the tree. Children make it a branch. */
export interface TreemapNode {
  name: string
  /** Leaf value. Omit on a branch — a branch is the sum of its children. */
  size?: number
  children?: TreemapNode[]
  [key: string]: unknown
}

/** The raw Recharts Treemap props a consumer may still reach for. */
export type TreemapExtras = Omit<ComponentProps<typeof RechartsTreemap>, 'data' | 'dataKey'>

export interface TreemapChartProps {
  /** Tile names → their label and paint. Optional: the ramp covers unnamed tiles. */
  config?: ChartConfig
  /** The tree. One level is a flat set of tiles; two is a nested treemap. */
  data: TreemapNode[]
  /**
   * What the chart shows, in a sentence a reader could act on. Required, and
   * announced to a screen reader even when it is not printed.
   */
  title: string
  /** Prints the title above the plot instead of hiding it from sight. */
  showTitle?: boolean
  /** A line under the title — the unit, the window, the caveat. */
  description?: ReactNode
  /** Merged onto the figure, last, so a call site can size or space it. */
  className?: string
  variant?: TreemapVariant
  /** The leaf field holding each tile's number. */
  dataKey?: string
  /** How square the tiles are pushed to be. Recharts' own squarify parameter. */
  aspectRatio?: number
  /** Prints each tile's name on it, where the tile is big enough to hold it. */
  showLabels?: boolean
  /** The hover panel. */
  children?: ReactNode
  chartProps?: TreemapExtras
  /** Drops the hidden table view. Only correct when the page prints the data itself. */
  hideDataTable?: boolean
}

/**
 * Part of a whole, when the whole has too many parts for a pie — and the parts
 * nest.
 *
 * A treemap encodes value as AREA, which the eye reads worse than length but
 * far better than angle, and it is the only form here that stays readable at
 * fifty items. Two rules make it honest: no negative values (an area cannot be
 * negative), and the tiles have to sum to something a reader recognises as the
 * whole.
 *
 * Reach for `<BarChart>` when there are under a dozen items and the ranking
 * matters — a bar's length is the more precise encoding, and a treemap's
 * layout deliberately does not order its tiles by value alone.
 *
 * @example
 * <TreemapChart title="Bundle size by package" data={packages} showLabels>
 *   <TreemapChart.Tooltip />
 * </TreemapChart>
 */
export function TreemapChart({
  config = {},
  data,
  title,
  showTitle,
  description,
  className,
  variant = 'ramp',
  dataKey = 'size',
  aspectRatio = 4 / 3,
  showLabels = true,
  children,
  chartProps,
  hideDataTable = false,
}: TreemapChartProps) {
  const chartId = useId().replace(/:/g, '')

  // Flattened for the table view, because a nested tree read aloud row by row
  // is not something anyone can follow — the leaves are the facts.
  const leaves = flatten(data)

  return (
    <ChartFigure
      title={title}
      showTitle={showTitle}
      description={description}
      className={className}
      table={
        hideDataTable
          ? false
          : {
              rows: leaves,
              rowKey: 'path',
              columns: [{ key: dataKey, label: 'Value' }],
            }
      }
    >
      <ChartContainer config={config}>
        <RechartsTreemap
          data={data}
          dataKey={dataKey}
          nameKey="name"
          aspectRatio={aspectRatio}
          isAnimationActive={false}
          content={
            <TreemapTile chartId={chartId} variant={variant} config={config} showLabels={showLabels} />
          }
          {...chartProps}
        >
          {children}
        </RechartsTreemap>
      </ChartContainer>
    </ChartFigure>
  )
}

/** Every leaf, with the path that names it. */
function flatten(nodes: TreemapNode[], prefix = ''): Record<string, unknown>[] {
  return nodes.flatMap((node) => {
    const path = prefix ? `${prefix} › ${node.name}` : node.name
    if (node.children?.length) return flatten(node.children, path)
    return [{ ...node, path }]
  })
}

interface TileProps {
  chartId: string
  variant: TreemapVariant
  config: ChartConfig
  showLabels: boolean
  // Recharts hands the geometry in as loose props on the cloned element.
  x?: number
  y?: number
  width?: number
  height?: number
  depth?: number
  index?: number
  name?: string
}

/**
 * One tile.
 *
 * The gap between tiles is a surface-coloured stroke rather than a smaller
 * rect, so the tiles still tile — a treemap whose parts do not touch stops
 * reading as a partition of one whole.
 */
function TreemapTile({
  chartId,
  variant,
  config,
  showLabels,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  depth = 1,
  index = 0,
  name = '',
}: TileProps) {
  if (width <= 0 || height <= 0) return null

  const slot =
    variant === 'nested'
      ? `var(--series-${Math.min(8, depth * 2)})`
      : name in config
        ? `var(--color-${cssName(name)}-0)`
        : `var(--series-${(index % 8) + 1})`

  // Only label a tile with room for one. A clipped word is worse than none.
  const roomForLabel = showLabels && width > 56 && height > 26

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={slot}
        stroke="var(--chart-surface)"
        strokeWidth={2}
      />
      {roomForLabel && (
        <text
          x={x + 8}
          y={y + 18}
          className="fill-(--chart-surface) text-[11px] font-medium"
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      {/* A hidden id so the tooltip can key off the same name the tile paints. */}
      <title>{name}</title>
      <desc>{chartId}</desc>
    </g>
  )
}

/** The hover panel. No heading: the tile's own name is the row label. */
function Tooltip({ variant, roundness }: ChartTooltipSlotProps) {
  return (
    <ChartTooltip
      cursor={false}
      content={<ChartTooltipContent nameKey="name" hideLabel roundness={roundness} variant={variant} />}
    />
  )
}

TreemapChart.Tooltip = Tooltip

export default TreemapChart
