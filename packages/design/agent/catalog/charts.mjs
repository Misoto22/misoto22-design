/**
 * The Charts entries, and nothing else.
 *
 * `catalog.mjs` is still the module: it keeps the typedefs, the group list, the
 * slug rule and the axis table, and it assembles `CATALOG` by concatenating these
 * files in `GROUPS` order. Nothing imports this one directly.
 *
 * A group is the unit because an entry is prose, not a row — several paragraphs
 * per component — and ninety-two of them in one file is a file only one person can
 * be writing at a time.
 *
 * These are the only components that need the `recharts` peer dependency, and
 * they ship from a separate entry point for that reason — see `ENTRY_POINTS`.
 */

/** @type {import('../catalog.mjs').CatalogEntry[]} */
export const CHARTS = [
  {
    name: 'AreaChart',
    group: 'Charts',
    summary: 'A filled series over a continuous axis, where the area means something.',
    when: 'Reading one magnitude over time. Comparing several series against each other is a LineChart — four translucent fills stacked on each other answer neither question.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'The <figure> ChartFigure draws, named through aria-labelledby rather than left to the figcaption, because deriving a name from a <figcaption> resolves in only some screen readers. The caption holds title and description together and is sr-only until showTitle is set, so a caveat written into description is announced and never printed.',
      },
      {
        element: 'Plot',
        required: true,
        description:
          'ChartContainer: a 16:9 box floored at 13rem and capped at 26rem, and the one place Recharts’ hard-coded #ccc axis and grid strokes are re-pointed at --chart-grid and --chart-axis.',
      },
      {
        element: 'Areas',
        required: true,
        description:
          '<AreaChart.Area>, one per series. Each generates its own id and scopes its gradient, its texture pattern and its reveal mask under it, so six variants share a plot without one overwriting another’s definitions.',
      },
      {
        element: 'Brush strip',
        description:
          '<AreaChart.Brush>, rendered in the container’s footer rather than inside the SVG. Both handles are role="slider" with aria-valuetext naming the row they sit on, so the window is reachable by arrow key.',
      },
      {
        element: 'Toolbar',
        description:
          '<AreaChart.Toolbar>, a role="group" row of at most five 44px icon buttons above the plot. Composing it also switches the plot’s own wheel, drag and keyboard zoom on, and the two drive one window rather than two.',
      },
      {
        element: 'Hidden data table',
        description:
          'An sr-only <table> built from the FULL data rather than the brushed window, so a reader on the table is never shown less than the CSV export holds. hideDataTable removes it, and zero rows render nothing.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Stack only quantities that genuinely add up. Under stackType="stacked" a band’s HEIGHT is its own value but its POSITION is the sum of everything under it, so stacking four independent rates draws a running total nobody measured.',
      },
      {
        kind: 'do',
        text: 'Reach for stackType="expanded" when the reading is share rather than volume: it sets Recharts’ expand offset and <AreaChart.YAxis> swaps in percentTick on its own, so the axis reads 0% to 100% without a formatter at the call site. A tickFormatter of your own still wins — the axis defers to it rather than dropping it, which it used to do without a word.',
      },
      {
        kind: 'do',
        text: 'Vary variant before the ramp on a two-area chart. The six fills are the primary encoding in the monochrome default, and under forced colours every --series-* token resolves to CanvasText — at which point the texture is the only thing left separating two areas.',
      },
      {
        kind: 'do',
        text: 'Pass xDataKey. It is the rowKey of the hidden table, and without it the table renders no row-header column at all: a screen reader gets a column of numbers with no month beside them.',
      },
      {
        kind: 'dont',
        text: 'Four translucent fills over each other is this form’s failure mode — the third area is read through two layers of --chart-fill and its own height stops being recoverable. Several series compared against each other is a LineChart, where nothing occludes anything.',
      },
      {
        kind: 'dont',
        text: 'connectNulls defaults to false for a reason: turned on, a gap in the data is drawn as a straight segment indistinguishable from a measured flat period. Set it only where the gap is a rendering artefact rather than a missing observation.',
      },
      {
        kind: 'dont',
        text: 'A single row draws nothing. One point has no segment to fill, dot is false unless <AreaChart.Dot> is composed, and the empty state does not fire because there IS a row — so the axes render over a blank plot.',
      },
    ],
    accessibility: [
      'title is required and becomes the figure’s accessible name, printed or not.',
      'The rows are rendered again as a visually hidden table, so the numbers are reachable rather than only drawn. hideDataTable opts out when the page already prints them.',
      'Six fill variants exist because in the monochrome default TEXTURE is the primary carrier of identity and the grey ramp is the second — which is also what keeps two series apart in greyscale print and under forced colours.',
      'The intro reveal is a per-frame SVG mask and is dropped entirely under prefers-reduced-motion, as is the crawling dash.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Reaches the plot, which Recharts’ accessibility layer makes navigable.' },
      { keys: ['←', '→'], does: 'Moves the cursor between points, announcing each.' },
    ],
    related: ['line-chart', 'bar-chart', 'composed-chart'],
  },
  {
    name: 'BarChart',
    group: 'Charts',
    summary: 'Discrete categories compared by length.',
    when: 'The categories are buckets rather than a continuum. If the axis is time and the reader is following a trend, an AreaChart or LineChart reads it faster.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, named by title whether or not the page prints a heading above it.',
      },
      {
        element: 'Bars',
        required: true,
        description:
          '<BarChart.Bar>, drawn through a custom shape: a transparent rectangle for the hit area, then the painted bar three pixels shorter than its slot so a stacked segment keeps a hairline of page between it and the one above. A bar shorter than that trim is floored at one pixel rather than taken to nothing, so a small count is never pixel-identical to an absent one.',
      },
      {
        element: 'Axes',
        description:
          '<BarChart.XAxis> and <BarChart.YAxis>, both flat by default — no tick line, no axis line. Every Recharts prop passes straight through, domain included, which is the door a truncated baseline comes in through.',
      },
      {
        element: 'Legend',
        description:
          '<BarChart.Legend>. With isClickable each entry is a real <button> carrying aria-pressed rather than a div with a handler, which is the difference between a filter a keyboard can reach and one it cannot.',
      },
      {
        element: 'Value labels',
        description:
          '<BarChart.Values>, a slot composed inside a bar. show defaults to last; all is for five or six bars where the exact figures are the point, and past that it is a table wearing a chart.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table of the FULL data rather than of the brushed window, so a reader on the table is never shown less than the CSV export holds. hideDataTable removes it, and zero rows render nothing.',
      },
      {
        element: 'Empty state',
        description:
          'ChartEmpty, rendered in place of the plot when data is empty — a title, a reason and an optional action, so a filter that matched nothing is told apart from a load that failed. empty={false} keeps the bare axes instead.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Reach for buffer on a period still open. It hatches the last ROW rather than the last bar on screen, so brushing back into the middle of the range hatches nothing — a month that closed in March is never drawn as still being counted.',
      },
      {
        kind: 'do',
        text: 'Leave the value axis anchored at zero. A bar encodes by LENGTH from the baseline, so a domain of ["dataMin", "dataMax"] passed through <BarChart.YAxis> turns a two percent gap into a doubled bar. This is the distortion a bar chart cannot survive and a LineChart can: a line encodes by slope, so clipping its domain rescales the reading rather than inventing one.',
      },
      {
        kind: 'do',
        text: 'Reach for orientation="horizontal" when the category names are long. The alternative is a tick label rotated under every column, and a rotated label is slower to read than the bar it names.',
      },
      {
        kind: 'do',
        text: 'Pass a tickFormatter to <BarChart.YAxis> under stackType="percent". Unlike AreaChart’s expanded stack, which swaps in percentTick itself, the bar chart’s axis keeps defaultTick — so a normalised chart reads 0 to 1 instead of 0% to 100%.',
      },
      {
        kind: 'do',
        text: 'Put the series that has to be compared across categories at the BASELINE of a stack. Only the bottom segment starts at zero; every band above it floats on the ones below, and reading a third band across twelve months is a comparison the eye cannot make. When that comparison is the point, group the bars instead.',
      },
      {
        kind: 'dont',
        text: 'hideDataTable leaves no exact figure anywhere. defaultTick compacts at ten thousand and above, so the axis says 1.2M and so do the <BarChart.Values> labels; the sr-only table, where every cell is a full toLocaleString, was the only place the real number was written.',
      },
      {
        kind: 'dont',
        text: 'Twenty bars at variant="default" is a wall rather than twenty values. stripped draws a 2px cap over a wash and stays countable at that density, which is the density it exists for.',
      },
      {
        kind: 'dont',
        text: 'Do not close barCategoryGap up. The space between groups is the only thing telling a reader that two adjacent bars are two series rather than two categories, so a grouped chart with no category gap reads as a stacked one.',
      },
    ],
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'Every bar carries an invisible full-height hit rectangle, so a 3px bar at the bottom of the scale is as easy to hit as a full-height one.',
      'A clickable legend entry is a real button with aria-pressed, not a div with a click handler.',
      'The staggered grow-in is anchored to the chart’s own start rather than to each bar’s mount, so a hover cannot replay it — and reduce-motion drops it entirely.',
    ],
    related: ['area-chart', 'composed-chart', 'radial-chart'],
  },
  {
    name: 'LineChart',
    group: 'Charts',
    summary: 'Several series compared over a continuous axis.',
    when: 'The reader is comparing series against each other. When the area under one line is the point, fill it — that is an AreaChart.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure> and its sr-only caption. description is announced with the title and printed only under showTitle, which is where a note about a clipped axis belongs.',
      },
      {
        element: 'Lines',
        required: true,
        description:
          '<LineChart.Line>, one per series at a 1.6px stroke. isClickable adds a second, fully transparent 15px line underneath the visible one, because a hairline is not a pointer target.',
      },
      {
        element: 'Point markers',
        description:
          '<LineChart.Dot> and <LineChart.ActiveDot>, both slots and both off by default. The resting dot shares the intro wipe mask so it arrives with its own line; the active dot is never masked, because it exists only on hover, long after the wipe has finished.',
      },
      {
        element: 'Buffer segment',
        description:
          'buffer draws the last leg dashed by measuring the real path with getPointAtLength, so a projection reads as a different kind of fact at any curve type. Fewer than two drawable points and it falls back to a plain curve.',
      },
      {
        element: 'Sonification control',
        description:
          '<LineChart.Sonify>, a real <button> above the plot that plays the visible rows as pitch. Sound never starts from an effect, only from that click, and it reads the brushed window rather than the whole series.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table of the full data. Recharts’ accessibilityLayer gives a keyboard cursor that announces one point at a time, which is navigation; this is the figures.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'This is the one chart in the family that survives a truncated value axis. A line encodes by SLOPE, so clipping the domain to the data’s own range is often what makes a two percent move visible at all — state the range in description when you do it.',
      },
      {
        kind: 'do',
        text: 'Reach for buffer on a period still open rather than dropping it. A part-month plotted solid reads as a crash; plotted as a dashed final leg it reads as what it is, which is incomplete.',
      },
      {
        kind: 'do',
        text: 'Compose <LineChart.Dot> when the series is sparse. With dots off — the default — five points are four segments, and the reader cannot tell a measured value from a bend in the interpolation.',
      },
      {
        kind: 'dont',
        text: 'A single row draws nothing at all: one point has no segment, dot is false unless composed, and the empty state does not fire because a row exists. Guard the one-row case at the call site.',
      },
      {
        kind: 'dont',
        text: 'Eight lines in one frame is a hairball, and a 1.6px stroke over an eight-step grey ramp makes it a worse one than a chromatic chart would. Past about five series the answer is Facet, not a ninth ramp slot — SERIES_SLOTS is 8 and there is no ninth.',
      },
      {
        kind: 'dont',
        text: 'connectNulls turns a gap into a straight segment that looks measured. It costs more here than on an area, because the reader reads the slope of that invented segment as a rate.',
      },
    ],
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'A clickable line gets a 15px transparent line underneath it, because a 1.6px stroke is not a pointer target.',
      'buffer draws the last segment dashed by measuring the real path length, so a projection is visibly a different kind of fact at any curve type.',
    ],
    related: ['area-chart', 'composed-chart'],
  },
  {
    name: 'ComposedChart',
    group: 'Charts',
    summary: 'Bars and lines over one axis — the volume, and the rate it moved at.',
    when: 'Two measures that share a scale. Two that do NOT share one belong in two charts or indexed to a common base: there is no second y-axis here, on purpose.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, named by title, with the composed marks inside one measured ChartContainer.',
      },
      {
        element: 'The single value axis',
        required: true,
        description:
          '<ComposedChart.YAxis>. One of them is the entire design: there is no dual-axis affordance and no second scale to configure, so the two measures are read against the same numbers.',
      },
      {
        element: 'Bars',
        description:
          '<ComposedChart.Bar>, the volume. Custom-shaped like BarChart’s, with the same transparent hit rectangle and the same grow-in anchored to the chart’s start rather than to each bar’s mount, so a hover cannot replay it.',
      },
      {
        element: 'Lines',
        description:
          '<ComposedChart.Line>, the rate. It inherits the chart’s curveType and reveal, so bars and line arrive as one figure rather than as two animations on two clocks.',
      },
      {
        element: 'Column highlight',
        description:
          'enableHoverHighlight dims every mark outside the hovered column, driven by the chart’s own onMouseMove index rather than by each mark’s hover — which is what makes a bar and a line in the same column light together.',
      },
      {
        element: 'Brush and toolbar',
        description:
          '<ComposedChart.Brush> in the container footer and <ComposedChart.Toolbar> above the plot. They drive one window, so a brushed range and a zoomed range cannot disagree about what is on screen.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table of the FULL data rather than of the brushed window, so a reader on the table is never shown less than the CSV export holds. hideDataTable removes it, and zero rows render nothing.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Index two measures to a common base — both as a percentage of January, say — when they do not share a scale. That is the substitute for the second axis this component deliberately does not have.',
      },
      {
        kind: 'do',
        text: 'Compose <ComposedChart.Legend> above two marks. A bar and a line at --series-1 and --series-2 differ by one step of grey and a shape, and only the shape is self-describing.',
      },
      {
        kind: 'do',
        text: 'Set enableHoverHighlight on every mark or on none. Set on one, the hovered column dims half of itself, which reads as a rendering fault rather than as emphasis.',
      },
      {
        kind: 'dont',
        text: 'Do not smuggle a second y-axis in through chartProps or a yAxisId on <ComposedChart.YAxis>. Recharts allows it; the component’s claim is that it does not. Two scales chosen independently let the author decide where the lines cross, which is the single most misleading thing a chart can do — and it always works, on any two series.',
      },
      {
        kind: 'dont',
        text: 'Do not assume the audio reading is here. AreaChart, BarChart and LineChart each carry a Sonify slot and this one does not, so a reader who has been listening across a dashboard falls back to the sr-only table — which is why hideDataTable is the prop not to set on this chart.',
      },
    ],
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'One value axis only. A dual-axis chart lets its author choose where the lines cross, which is the single most misleading thing a chart can do.',
      'enableHoverHighlight dims every bar outside the hovered column, driven by the chart’s own tooltip index.',
    ],
    related: ['bar-chart', 'line-chart'],
  },
  {
    name: 'PieChart',
    group: 'Charts',
    summary: 'Parts of one whole.',
    when: 'Roughly what share, and nothing more precise. Ranking or comparing wedges — especially across two pies — is a BarChart’s job.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state at zero rows. There are no axes here, so without one a pie at zero rows was a name over a blank box with the hidden table returning null — the picture and its text equivalent silent together. empty={false} restores that, for a chart whose emptiness is the reading.',
      },
      {
        element: 'Wedges',
        required: true,
        description:
          '<PieChart.Pie>. Each sector is painted from a diagonal gradient keyed on the row’s nameKey value, so config keys must match those values exactly — a row whose name is absent from config points at a gradient that was never defined and comes out unpainted.',
      },
      {
        element: 'Legend',
        description:
          '<PieChart.Legend>, under the pie and centred by default. A pie has no category axis naming its sectors, so this is where the names live.',
      },
      {
        element: 'Wedge labels',
        description:
          '<PieChart.Label>, a LabelList reversed out in --chart-surface. Its dataKey defaults to the pie’s VALUE key, so composing it prints the numbers.',
      },
      {
        element: 'Tooltip',
        description:
          '<PieChart.Tooltip>, with the heading suppressed: the wedge’s own name is the row label, so a heading would print it twice.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Keep it under about five wedges. Past that the reader is ranking angles, which is the comparison a pie is worst at — a BarChart puts the same shares on a length scale and the ranking falls out of the picture for free.',
      },
      {
        kind: 'do',
        text: 'Compose <PieChart.Label> whenever the exact share matters. It defaults to the value key, and a printed number removes the angle estimate entirely, which is this form’s only real weakness and its cheapest fix.',
      },
      {
        kind: 'do',
        text: 'Give it an innerRadius. A donut is read by arc LENGTH rather than by wedge area, which the eye does better, and the hole is somewhere to put the total.',
      },
      {
        kind: 'dont',
        text: 'A negative value has no wedge. Parts of one whole cannot include a negative part, so a breakdown carrying a refund or churn against expansion is a WaterfallChart, which is built for signed contributions.',
      },
      {
        kind: 'dont',
        text: 'Two pies side by side is not a comparison. Reading a wedge across two circles is harder than reading two wedges inside one, and the reader will try anyway — put the two periods in one grouped BarChart.',
      },
      {
        kind: 'dont',
        text: 'Pass a POSITIVE paddingAngle if the chart has to survive forced colours. There is one fill variant here, so all eight --series-* tokens collapse to CanvasText and every wedge is the same solid shape; what separates them is geometry, and a gap of a degree or two is it. The stroke is not the mechanism — it is drawn only when paddingAngle is NEGATIVE, where the wedges overlap and the surface-coloured stroke re-separates them into stacked cards. 0 is the one value with neither, and a default pie in forced colours is one uniform disc with the legend and the labels carrying the whole reading.',
      },
    ],
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'The legend sits under the pie by default, because a pie has no category axis naming its sectors.',
      'Compose a Label to print the numbers on the wedges: a pie’s weakness is that an angle is hard to read, and a printed number removes the guess.',
      'One fill variant, deliberately. A wedge is small and awkwardly shaped, and a texture inside one reads as noise.',
    ],
    related: ['radial-chart', 'bar-chart'],
  },
  {
    name: 'RadarChart',
    group: 'Charts',
    summary: 'A profile across several named dimensions.',
    when: 'Recognising a silhouette. The area a radar encloses depends on the order its spokes happen to be in, so it is the wrong chart for comparing magnitudes.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with the polar plot inside one ChartContainer.',
      },
      {
        element: 'Polygons',
        required: true,
        description:
          '<RadarChart.Radar>. variant="filled" is the default and paints at 2.2 times --chart-fill, because a radar’s fill IS the mark rather than a wash under a line and has to hold its shape where two of them overlap.',
      },
      {
        element: 'Spoke labels',
        description:
          '<RadarChart.PolarAngleAxis>, the names around the perimeter. They are the only thing that says what a corner of the silhouette measures.',
      },
      {
        element: 'Radial scale',
        description:
          '<RadarChart.PolarRadiusAxis>, and it is opt-in. Leave it out and the rings carry no numbers at all: the reader has a shape and no idea what one ring is worth.',
      },
      {
        element: 'Grid',
        description:
          '<RadarChart.PolarGrid>, polygonal rather than circular by default, so the rings line up with the polygon the data draws over them.',
      },
      {
        element: 'Legend',
        description:
          '<RadarChart.Legend>. Two overlapping outlines two steps apart on the grey ramp name nothing, and there is no axis here to name them instead.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Fix the spoke ORDER and keep it fixed across every radar on the page. The area a polygon encloses is a function of the order the dimensions happen to sit in, so re-ordering the spokes changes the silhouette without changing one number.',
      },
      {
        kind: 'do',
        text: 'Put every dimension on a comparable scale first — a percentile, a score out of ten, an index. One radius serves all the spokes, so a spoke in milliseconds beside one in percent draws a spike that means nothing.',
      },
      {
        kind: 'do',
        text: 'Switch to variant="lines" past two series. Filled polygons overlap, and judging areas through two layers of translucency is precisely what this form is worst at.',
      },
      {
        kind: 'dont',
        text: 'Do not read magnitude off it. A radar is for recognising a silhouette — the same profile before and after — and which of two is bigger is a question a BarChart answers and this one only appears to.',
      },
      {
        kind: 'dont',
        text: 'Do not skip <RadarChart.PolarRadiusAxis> and call the chart finished. It renders, the rings render, and nothing on screen says whether the outer ring is 100 or 1,000; the sr-only table still has the figures, the sighted reader does not.',
      },
    ],
    accessibility: [
      'title is required; the rows are also rendered as a visually hidden table.',
      'Two or three series at most: filled polygons overlap, and judging areas through two layers of translucency is what a radar is worst at. Past that, variant="lines".',
    ],
    related: ['line-chart', 'pie-chart'],
  },
  {
    name: 'RadialChart',
    group: 'Charts',
    summary: 'Values on an arc — a gauge, or a few totals against one scale.',
    when: 'A single value against a fixed total. Past about four bars a BarChart is the honest choice, because a radial bar’s radius is not its value.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state at zero rows. Its hidden table needs a value field, which it takes from valueKey or, failing that, from the dataKey of the composed <RadialChart.RadialBar> — so a chart that names neither still has no table.',
      },
      {
        element: 'Arcs',
        required: true,
        description:
          '<RadialChart.RadialBar>, one per row, 14px thick with a 5px cap. variant="semi" drops the centre to 70% so a half arc sits in the middle of its own box rather than at the top of it.',
      },
      {
        element: 'Track',
        description:
          'showTrack, on by default, painting the unfilled remainder behind each arc in --chart-track. It is what makes a gauge a gauge: without it there is no visible whole for the fill to be a part of.',
      },
      {
        element: 'Scale',
        description:
          'The PolarAngleAxis the root inserts when max is set, with domain [0, max] and its ticks off. Leave max unset and the domain is taken from the data instead.',
      },
      {
        element: 'Legend',
        description:
          '<RadialChart.Legend>. An arc has no category axis, so above one bar this is the only thing naming them.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Set max on anything that is a gauge. Without it the scale comes from the data, so the largest bar always fills the arc and 62% and 98% are drawn identically.',
      },
      {
        kind: 'do',
        text: 'Pass valueKey when the arc is not the only mark. It names the field the hidden table prints and the field the LEGEND reports a selection from; without either it or a composed <RadialChart.RadialBar> there is no value field, and the table is not empty but absent.',
      },
      {
        kind: 'do',
        text: 'Use variant="semi" for a single value. A half arc reads as a dial with a floor and a ceiling, where a full ring asks the reader to work out what a whole circle was worth.',
      },
      {
        kind: 'dont',
        text: 'Do not compare bars across radii. A radial bar’s LENGTH is its value but its RADIUS is not, so an inner arc and an outer arc holding the same number are drawn different lengths — past about four bars a BarChart is the honest form.',
      },
      {
        kind: 'dont',
        text: 'Do not let a reader take an arc as a share of the ring when max is unset. A full sweep then means the biggest thing here, which is a different sentence from all of it.',
      },
    ],
    accessibility: [
      'title is required; pass valueKey and the rows are also rendered as a visually hidden table.',
      'Set max or the scale comes from the data and the largest bar always fills the arc — which makes 62% and 98% look identical.',
      'showTrack draws the unfilled remainder, which is what makes a gauge readable at all.',
    ],
    related: ['pie-chart', 'bar-chart'],
  },
  {
    name: 'SankeyChart',
    group: 'Charts',
    summary: 'Where a quantity goes as it moves through stages.',
    when: 'A funnel, a budget, an energy or traffic breakdown. The only chart here whose data is a graph rather than a table.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, named by title, with the diagram inside one ChartContainer.',
      },
      {
        element: 'Node rectangles',
        required: true,
        description:
          'The root’s own node renderer. A node whose name is in config is painted from its gradient; one that is not falls back to currentColor, so it is drawn plainly rather than lost.',
      },
      {
        element: 'Node labels',
        description:
          '<SankeyChart.NodeLabel>, composed inside <SankeyChart.Node>, and entirely opt-in. Leave it out and NOTHING on the diagram is named — there is no legend here, so the names exist only in the tooltip and in the hidden table.',
      },
      {
        element: 'Flow bands',
        description:
          '<SankeyChart.Link>. gradient fades the source’s colour into the target’s and is the variant that actually reads as flow; solid gives up colour entirely and lets the node rectangles carry identity.',
      },
      {
        element: 'Hidden data table',
        required: true,
        description:
          'The sr-only table lists the LINKS — from, to, value — rather than the nodes, because a table of node totals loses every from-and-to the diagram exists to state.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Treat the nodes array as an addressing table. A link’s source and target are INDEXES into it, so inserting a node at the front silently re-points every link at a different pair — and the layout still renders, which is why this belongs in a test rather than in an eyeball.',
      },
      {
        kind: 'do',
        text: 'Compose <SankeyChart.Node> with a <SankeyChart.NodeLabel> inside it. Names are opt-in and there is no legend to fall back on, so a sankey without labels is a set of anonymous grey bands.',
      },
      {
        kind: 'do',
        text: 'Keep the flows conserved, or give the shortfall a node of its own with a name. Band width is the only arithmetic on screen, and a node that quietly loses eight percent simply reads as a smaller node.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for it when the quantity only narrows along one path. That is a FunnelChart; a sankey spends its whole layout budget on splits that are not there.',
      },
      {
        kind: 'dont',
        text: 'Do not put twenty nodes in one column. nodePadding is 10px and the layout distributes what is left, so past a dozen a node rectangle is a few pixels tall and a label centred on it has nowhere to sit.',
      },
    ],
    accessibility: [
      'title is required. The hidden table lists the FLOWS rather than the nodes — a table of node totals would lose every “from → to” the diagram exists to show.',
      'Four link variants: gradient reads as flow, source and target attribute a band to one end, solid gives up colour and lets the nodes carry identity.',
    ],
    related: ['bar-chart'],
  },
  {
    name: 'ScatterChart',
    group: 'Charts',
    summary: 'Two measures against each other, one mark per observation.',
    when: 'Correlation, clustering, outliers — the questions that do not survive being bucketed into a bar. The only chart here whose x axis is a number rather than a category.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with isLoading and an empty state. Emptiness is read from the declared table rows, for the same reason the table is declared at all: the observations live on each <Scatter>, and the root cannot see them.',
      },
      {
        element: 'Numeric axes',
        required: true,
        description:
          '<ScatterChart.XAxis> and <ScatterChart.YAxis>, both type="number" by default. The only chart in the group whose horizontal axis is a measurement rather than a category.',
      },
      {
        element: 'Clouds',
        required: true,
        description:
          '<ScatterChart.Scatter>, one per series, each carrying its OWN data array rather than reading the root’s. Six mark shapes, and a solid mark takes a 1px --chart-surface ring so two coincident observations stay countable.',
      },
      {
        element: 'Size channel',
        description:
          '<ScatterChart.ZAxis>, range [40, 400] by default. That range is in AREA, not radius: doubling a radius quadruples the ink, which is how a bubble chart usually lies.',
      },
      {
        element: 'Crosshair',
        description:
          'The tooltip’s cursor, a pair of rules rather than one band. A scatter point is located by two coordinates and a single vertical cursor answers half of that.',
      },
      {
        element: 'Declared table',
        description:
          'table is a PROP here, not inferred. Scatter data lives on each series, so there are no rows on the root to read off — and passing nothing ships a figure with no table at all.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Declare table. It is the one chart in the group whose hidden table cannot be derived, so omitting it fails silently: the figure renders, is named, and has no numbers behind it.',
      },
      {
        kind: 'do',
        text: 'Separate series by shape before anything else. Circle against cross stays legible where two steps of grey do not, and shape survives overprinting and forced colours — where every --series-* token becomes CanvasText and a lightness step is gone.',
      },
      {
        kind: 'do',
        text: 'Reach for variant="outline" or shape="ring" on a dense cloud. A hollow mark shows what is under it; a solid one at two thousand points is a silhouette of the densest region and nothing else.',
      },
      {
        kind: 'dont',
        text: 'Do not vary size between series to mean something. size is a flat radius in pixels, so it encodes nothing while looking exactly as if it does; <ScatterChart.ZAxis> is the only path that maps a value to a mark’s area.',
      },
      {
        kind: 'dont',
        text: 'Past three series shape stops separating them — circle, cross and triangle are distinct, and a fourth glyph is a diamond most readers see as a rotated square. Small multiples on shared axes is the answer, not a fourth mark.',
      },
    ],
    accessibility: [
      'title is required. The table view is declared rather than inferred: scatter data lives on each series, so there is no single set of rows to read off the root.',
      'Shape does the work hue does elsewhere. Two overlapping clouds separate far better by circle-versus-cross than by two steps of grey — and shape survives overprinting, which a lightness step does not.',
      'A solid mark carries a surface-coloured ring, so two observations that land on top of each other stay countable.',
      'ZAxis maps its measure to a mark’s AREA, not its radius: doubling a radius quadruples the ink, which is the most common way a bubble chart lies.',
    ],
    related: ['line-chart', 'heatmap'],
  },
  {
    name: 'FunnelChart',
    group: 'Charts',
    summary: 'Stages that only ever narrow.',
    when: 'A signup flow, a hiring pipeline, a checkout. When the flow can SPLIT rather than only shrink, it is a SankeyChart — a funnel has one path through it by construction.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state at zero stages. There is still no loading skeleton, so that state remains the call site’s job.',
      },
      {
        element: 'Stages',
        required: true,
        description:
          '<FunnelChart.Funnel>. The rows are drawn in the order given and never sorted, and each stage is cut from the next by a --chart-surface stroke gap pixels wide rather than by a transparent gap, so the stages still touch.',
      },
      {
        element: 'Stage labels',
        description:
          '<FunnelChart.Label>, positioned right by default. Its dataKey defaults to the NAME field, not the value — printing the numbers means pointing it at the value key yourself.',
      },
      {
        element: 'Tooltip',
        description:
          '<FunnelChart.Tooltip>, heading suppressed and cursor off. There is no axis here for a crosshair to run along.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table, one row per stage. It is the only exact reading this form offers, because a funnel has no axis and no ticks anywhere on it.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Point <FunnelChart.Label> at the value field. With no dataKey it prints the stage NAME, which the reader already has, and the number — the one thing the taper cannot be read for — goes unprinted.',
      },
      {
        kind: 'do',
        text: 'Order the rows widest first yourself. The component draws them in the order it is handed and does not sort, so a stage out of place renders a funnel that widens, which a reader will read as a data error.',
      },
      {
        kind: 'do',
        text: 'Keep variant="stepped" unless the stages are also a sequence of kinds. ramp walks the series ramp stage by stage, which encodes the drop a second time when the taper has already said it.',
      },
      {
        kind: 'dont',
        text: 'Do not use it for a flow that splits. A funnel has one path through it by construction; where a stage divides into two outcomes the honest form is a SankeyChart, which can draw both branches.',
      },
      {
        kind: 'dont',
        text: 'Do not read the fall-off off the shape. The taper is a ratio between neighbours and the eye reads the enclosed AREA, so a shallow drop is exaggerated and a steep one flattened, with no axis anywhere to check it against.',
      },
    ],
    accessibility: [
      'title is required; the stages are also rendered as a visually hidden table.',
      'The taper encodes a ratio between neighbouring stages and the eye reads the enclosed area, so a funnel exaggerates a shallow drop. Compose a Label to print the numbers — that is the relief.',
      'The default variant holds one fill for every stage and lets the shape carry the drop. A ramp that also darkens each stage encodes the same fact twice.',
    ],
    related: ['sankey-chart', 'bar-chart'],
  },
  {
    name: 'TreemapChart',
    group: 'Charts',
    summary: 'Part of a whole, when the whole has too many parts for a pie — and the parts nest.',
    when: 'Fifty items where a pie fails at six. Under a dozen items with a ranking to read, a BarChart’s length is the more precise encoding.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, named by title, wrapping one ChartContainer.',
      },
      {
        element: 'Tiles',
        required: true,
        description:
          'The root’s own tile renderer. The gap between tiles is a 2px --chart-surface STROKE rather than a smaller rect, so the tiles still tile — a treemap whose parts do not touch stops reading as a partition of one whole.',
      },
      {
        element: 'Tile labels',
        description:
          'showLabels, on by default, but a tile is only labelled when it is wider than 56px and taller than 26px. Below that the name is dropped rather than clipped, so the long tail is unlabelled by design.',
      },
      {
        element: 'Tooltip',
        description:
          '<TreemapChart.Tooltip>, keyed on the tile name. It is doing more work here than elsewhere: it is the only way to name a tile too small to carry its own label.',
      },
      {
        element: 'Hidden data table',
        required: true,
        description:
          'The sr-only table lists the LEAVES, each with the path that names it. A nested tree read row by row is not something anyone can follow, so the hierarchy is flattened into the row header instead.',
      },
      {
        element: 'Paint',
        description:
          'variant="ramp" walks --series-1 to --series-8 by tile INDEX; variant="nested" steps by DEPTH instead, which is the right encoding once the question is what is inside what.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Feed it non-negative values that sum to something the reader recognises as the whole. Area is the encoding, an area cannot be negative, and a leaf at zero or below is laid out at zero width and dropped from the picture — the hidden table prints it as “not drawn” rather than letting the two views disagree about how many leaves there are.',
      },
      {
        kind: 'do',
        text: 'Compose <TreemapChart.Tooltip> whenever there is a tail. Anything under 56 by 26 pixels carries no label at all, and on a fifty-item treemap that is most of it.',
      },
      {
        kind: 'do',
        text: 'Switch to variant="nested" once the tree has a second level. ramp keys the fill off the tile index, so it separates siblings and says nothing at all about depth.',
      },
      {
        kind: 'dont',
        text: 'Do not read the ramp as a key. The slot is index modulo eight, so tile one and tile nine are painted identically — the fill here is separation, not identity, and the picture will not correct a reader who assumes otherwise.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for it to rank a dozen items. A bar’s length is read far more precisely than a rectangle’s area, and the squarify layout deliberately does not order tiles by value alone, so a reader cannot even scan them in order.',
      },
    ],
    accessibility: [
      'title is required. The table view lists the LEAVES with the path that names them: a nested tree read row by row is not something anyone can follow.',
      'Area is the encoding, so the data must be non-negative and must sum to something the reader recognises as the whole.',
      'The gap between tiles is a surface-coloured stroke rather than a smaller rect — a treemap whose parts do not touch stops reading as a partition.',
    ],
    related: ['pie-chart', 'bar-chart'],
  },
  {
    name: 'BoxPlot',
    group: 'Charts',
    summary: 'The spread of a measurement, per category.',
    when: 'How variable is this, across six things at once. When the shape of ONE distribution is the question it wants a Histogram; when there are few enough observations to draw them all, a ScatterChart.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state when no category survives resolving. empty={false} keeps the axes for a chart whose emptiness is itself the reading.',
      },
      {
        element: 'Boxes',
        required: true,
        description:
          '<BoxPlot.Boxes>: one range bar per category spanning min to max, entirely unpainted, with the glyph drawn over it. Recharts supplies the category band and the scale; the box, the median rule, the whiskers and the outlier dots are the package’s own.',
      },
      {
        element: 'Value axis',
        description:
          '<BoxPlot.YAxis>, and it is deliberately NOT anchored at zero — a box plot compares distributions, and dragging the domain to zero to be honest about bar length flattens every box into the same band of pixels. The honesty it owes is a labelled axis, which it has.',
      },
      {
        element: 'Notch',
        description:
          'notch pinches the box in at the median by 1.58 times IQR over the square root of n — a confidence interval drawn inside the shape it belongs to. It needs count on every box; a box without one is drawn square and says nothing about it.',
      },
      {
        element: 'Outlier dots',
        description:
          'showOutliers, on by default. Points past Tukey’s 1.5 IQR fences are drawn one dot each, and the whiskers then stop at the most extreme observation still INSIDE the fence rather than at the fence itself, so no whisker claims a reading the data does not contain.',
      },
      {
        element: 'Hidden data table',
        required: true,
        description:
          'The sr-only table carries all five numbers per category plus the outlier count, so the figure is fully readable without seeing the glyph.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Carry count on every box. A box over six observations and a box over six thousand are drawn identically, and count is also what a notch reads — without it, notch is accepted and quietly does nothing.',
      },
      {
        kind: 'do',
        text: 'Say which quantile rule produced a pre-computed summary. This component uses R type 7 when it summarises raw values, and on [1, 2, 3, 4] that puts the lower quartile at 1.75 where the median-of-the-lower-half rule puts it at 1.5 — the same data under two rules is two different pictures.',
      },
      {
        kind: 'do',
        text: 'Hand it the raw values rather than a summary when you have them. One pass applies Tukey’s fences, splits the outliers out and fills count in, so the five numbers and the dots cannot drift apart.',
      },
      {
        kind: 'dont',
        text: 'A box cannot tell one hump from two. A latency series with a cache path and a database path in it draws exactly the box a smooth distribution centred in the same place draws, and the middle of that box is a value almost nothing takes. When the SHAPE is the question it is a Histogram.',
      },
      {
        kind: 'dont',
        text: 'A category whose values array is empty is dropped outright — no box, no tick, no table row — because summarising it yields nothing to draw. The chart renders six boxes where seven were asked for and says nothing about the seventh.',
      },
      {
        kind: 'dont',
        text: 'One observation draws a box with no box: q1, the median and q3 are the same number, the IQR is zero, and the glyph collapses to a single rule. It is not an error and it is not a distribution, so guard it at the call site.',
      },
    ],
    accessibility: [
      'A box is five numbers, and five numbers cannot tell one hump from two. A bimodal distribution draws exactly the same box as a smooth one centred in the same place — the component says so in its own description rather than in a footnote.',
      'It also hides sample size: a box over six points and a box over six thousand are drawn identically. Carry count, and turn on notched whenever medians are being compared.',
      'Raw values are summarised with Tukey’s fences, which is stated on the page rather than assumed — a different fence rule draws different outliers from the same data.',
      'The hidden data table carries all five numbers per category, so the figure is readable without seeing the glyph.',
    ],
    related: ['histogram', 'scatter-chart'],
  },
  {
    name: 'Histogram',
    group: 'Charts',
    summary: 'The shape of one distribution.',
    when: 'A single distribution has to be understood — two clusters, a hard floor, a pile-up at a timeout. Several distributions side by side want a BoxPlot.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state when no bucket survives binning — which is what zero finite observations produces.',
      },
      {
        element: 'Bars',
        required: true,
        description:
          '<Histogram.Bars>, each drawn from its bucket’s own two edges rather than placed in an equal category slot, which is what lets an uneven bucket be as wide as it really is. radius is 0 by default, unlike BarChart’s: a rounded corner draws a gap between two buckets that touch.',
      },
      {
        element: 'Measured axis',
        required: true,
        description:
          '<Histogram.XAxis>, numeric, running from the first bucket’s lower edge to the last one’s upper edge.',
      },
      {
        element: 'Count axis',
        description:
          '<Histogram.YAxis>. Under mode="frequency" it is a count; under mode="density" it is count over n times width, and the bars then enclose an area of one.',
      },
      {
        element: 'Binning rule',
        description:
          'Not a mark on screen and the most consequential part of the figure: bins takes a bucket count or the explicit edges, and the default is Freedman-Diaconis capped at 200 buckets, falling back to Sturges when the interquartile range is zero. Explicit edges are also a RANGE — an observation outside the first and last has no bucket, and is counted into the tooltip’s share and into a Below or Above row of the table rather than dropped.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table prints each bucket’s two edges as its row header and its count beside them — the only exact reading a binned chart can offer, since every bar stands for a range rather than for a value. Observations outside explicit edges get their own Below and Above rows, because they have no bar anywhere.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Name the binning rule on the page. The same numbers cut into eight buckets and into eighty are two different pictures, and a gap between two humps can be created or erased by moving one edge — so look at more than one width before believing a feature.',
      },
      {
        kind: 'do',
        text: 'Set mode="density" whenever the buckets are uneven. Under frequency a bucket twice as wide stands twice as tall at the same underlying rate, which is the trap pre-counted buckets from a metrics backend walk straight into.',
      },
      {
        kind: 'do',
        text: 'Give values or data, never both. data wins when both arrive, so the values array is then binned by nothing and drawn by nothing, with no warning anywhere.',
      },
      {
        kind: 'dont',
        text: 'Do not read the tooltip’s share as a share of the bars. It is a share of the SAMPLE, so a set of buckets summing to 96% is telling you the other 4% fell outside your own edges — which is the one reading a share taken over the drawn buckets could never give, because it always sums to 100.',
      },
      {
        kind: 'dont',
        text: 'Do not use it to compare several distributions. Two histograms overlaid occlude each other and six side by side do not fit; that is a BoxPlot, which spends a tenth of the ink per distribution.',
      },
      {
        kind: 'dont',
        text: 'Do not assume the automatic rule kept the resolution you asked for. Freedman-Diaconis divides by the interquartile range, so a tight middle with a long tail asks for tens of thousands of sub-pixel bars — the 200-bucket cap turns that into a coarse histogram rather than a hung tab, and a coarse histogram is a different picture.',
      },
      {
        kind: 'dont',
        text: 'Do not read a single-value distribution as a shape. Every observation on one number still draws: the edges become that value plus and minus a half, and the result is one honest bar that is not a distribution.',
      },
    ],
    accessibility: [
      'The shape is a property of the bin width, not only of the data: the same numbers cut into eight buckets and into eighty are two different pictures. The rule that drew it — Freedman–Diaconis by default — is named on the page.',
      'The x axis is numeric and every bar is drawn from its own two edges, so an uneven bucket is as wide as it really is rather than flattened into an equal slot.',
      'mode="density" corrects the trap uneven buckets create: under frequency a bucket twice as wide stands twice as tall at the same underlying rate.',
      'The hidden data table prints each bucket’s two edges and its count, which is the only exact reading a binned chart can offer.',
    ],
    related: ['box-plot', 'bar-chart'],
  },
  {
    name: 'WaterfallChart',
    group: 'Charts',
    summary: 'How a total got from one figure to another.',
    when: '“Why did this change”, where the contributions can be negative. A pie cannot hold a negative slice; a BarChart is right when the parts need not add up to the gap between two totals.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure>, with an empty state at zero steps. description is where the ordering caveat goes, and it is sr-only until showTitle is set.',
      },
      {
        element: 'Steps',
        required: true,
        description:
          '<WaterfallChart.Bars>: one floating range bar per step, running from the previous total to the new one, with a custom shape over it. Increases and totals take the solid series fill, decreases the 45 degree hatch, so direction survives greyscale and forced colours.',
      },
      {
        element: 'Connectors',
        description:
          'connectors, on by default, joining each bar’s closing edge to where the next one starts. Without them a waterfall is a row of bars floating at unrelated heights and the reader has to reconstruct the cascade.',
      },
      {
        element: 'Zero baseline',
        required: true,
        description:
          'A reference line at zero that <WaterfallChart.Bars> draws itself. It is what the total bars stand on, and a waterfall with no visible zero asks the reader to take every floating bar on trust.',
      },
      {
        element: 'Step labels',
        description:
          'showValues, and it is OFF by default. It prints each step’s signed change beside its bar — worth more here than anywhere else, because an intermediate bar has no baseline under it and its length is the one thing the axis cannot give back.',
      },
      {
        element: 'Hidden data table',
        description:
          'The sr-only table carries the CHANGE and the RUNNING TOTAL per step, which is exactly the pair the picture encodes as a length and a position.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Turn showValues on. It is off by default and it is the relief for this form’s central weakness: an intermediate bar floats, so a reader can see that a step was small and cannot see how small.',
      },
      {
        kind: 'do',
        text: 'Leave value off the closing total step. Omitted, it is computed from the deltas above it; typed by hand it can disagree with them, and the chart will draw the disagreement without saying a word.',
      },
      {
        kind: 'do',
        text: 'Say in description when the step order is editorial, and pass showTitle so the sentence is actually printed. The connectors draw the steps as a sequence and most breakdowns are not one — churn and expansion in the same month are simultaneous — and a reader takes the leftmost bar as the first cause.',
      },
      {
        kind: 'dont',
        text: 'Do not net two opposing movements into one step. A bar reading minus twenty that is really plus one hundred and eighty against minus two hundred is drawn exactly like a quiet month, and showing what moved is the entire purpose of the form.',
      },
      {
        kind: 'dont',
        text: 'Do not compare an intermediate bar with a total bar by eye. Only the totals sit on the zero line; everything between them is a length at an arbitrary height, so a small step high in the cascade and a large one near zero are not on comparable ground.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for a pie when the contributions are signed. This is the form that exists because a pie cannot hold a negative slice — and a BarChart is the right one instead when the parts need not add up to the gap between two totals.',
      },
    ],
    accessibility: [
      'The connectors draw the steps as a sequence, and most breakdowns are not sequential — churn and expansion in the same month are simultaneous, and a reader takes the leftmost bar as the first cause. Where the order is arbitrary, say so in description.',
      'Intermediate bars are floating lengths read against no baseline, so a small step high up the cascade is hard to compare with a large one near zero. Total bars sit on the axis and are the only ones a reader can read absolutely.',
      'Direction is carried by the label’s sign and the bar’s texture as well as its position, so the reading survives greyscale and forced colours.',
      'A closing bar with no value is computed from the deltas, which keeps the arithmetic in the data rather than in the caller’s head.',
    ],
    related: ['bar-chart', 'funnel-chart'],
  },
  {
    name: 'Facet',
    group: 'Charts',
    summary: 'The same chart once per group, on one shared scale.',
    when: 'Eight series overplot into a hairball in one frame. Two or three series that genuinely need comparing point-for-point still belong in one chart.',
    anatomy: [
      {
        element: 'Figure frame',
        required: true,
        description:
          'ChartFigure’s <figure> around the whole grid, named by title. Its empty state has no false escape hatch, unlike a single chart’s: an empty pair of axes is at least a chart, and an empty grid is nothing.',
      },
      {
        element: 'Panel grid',
        required: true,
        description:
          'A role="list" of <li> panels on a CSS auto-fit track. list-none strips the list role in Safari, so it is set back by hand — a grid of twelve plots that does not announce twelve items takes away the reader’s only cue for how far they have to go.',
      },
      {
        element: 'Panel name',
        description:
          'A <p> above each plot. showPanelNames={false} makes it sr-only rather than removing it, because a grid whose panels a screen reader cannot tell apart is one figure with twelve anonymous plots in it.',
      },
      {
        element: 'Shared domain',
        required: true,
        description:
          'panel.domain, computed across the panels that survive the cap and handed to the render function. It is not applied for you: a panel that does not pass it to its own value axis has opted back into independent scales.',
      },
      {
        element: 'Grid-level legend and axis labels',
        description:
          'legend, yLabel and xLabel, printed once above and below the grid. A legend inside every panel is the same three swatches twelve times, restating what the reader learned from the first one.',
      },
      {
        element: 'Overflow note',
        description:
          'The line under a capped grid, saying how many groups were left out or folded. limit is 12 by default and nothing is ever dropped in silence.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass panel.domain to the panel chart’s value axis. That one line is what the component is for: on independent scales a group peaking at 40 and one peaking at 4,000 draw the same shape, so the comparison is not merely lost, it is inverted — and nothing on screen says so.',
      },
      {
        kind: 'do',
        text: 'Name every plotted field in value. It is what the shared domain is measured over, so a panel that draws a series value does not mention can overflow its own axis while the rest of the grid looks correct.',
      },
      {
        kind: 'do',
        text: 'Set hideDataTable when the panel charts carry their own. Every chart in the package renders its rows as an sr-only table, so a twelve-panel grid otherwise puts thirteen tables into the accessibility tree.',
      },
      {
        kind: 'do',
        text: 'Keep sort="max" for a grid a reader scans and switch to "name" for one they look things up in. Reading order is what a reader takes as ranking, so it is a decision in either direction.',
      },
      {
        kind: 'dont',
        text: 'overflow="fold" is not free. The folded panel is the SUM of the tail at each category and its statistics go into the shared domain, so folding twenty-eight small groups can produce one tall panel that squashes the twelve the reader came for. Use note when the tail is numerous rather than large.',
      },
      {
        kind: 'dont',
        text: 'Do not turn includeZero off under bars or areas. It is on by default for the same reason a bar axis is anchored at zero — a length read against a truncated baseline overstates every difference, and a grid exists to have its differences compared.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for it at two or three series. Faceting buys back every individual shape and pays for it with the direct overlay, and crossovers, gaps and shares of one total are exactly what the overlay was for.',
      },
    ],
    accessibility: [
      'The shared domain is the default and the whole point: on independent scales a group peaking at 40 and one peaking at 4,000 draw the same shape, and the comparison the reader came for is not merely lost but inverted.',
      'Every panel is a figure with its own accessible name, so a screen reader walks eight named charts rather than one unnamed grid.',
      'Panels beyond max fold into a stated overflow rather than being dropped, and the count is printed — a grid silently missing four groups is not something a reader can detect.',
      'Panel order is a choice the call site makes explicitly through sort, because reading order is what a reader takes as ranking.',
    ],
    related: ['line-chart', 'sparkline'],
  },
]
