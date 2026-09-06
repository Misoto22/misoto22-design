/**
 * The Data entries, and nothing else.
 *
 * `catalog.mjs` is still the module: it keeps the typedefs, the group list, the
 * slug rule and the axis table, and it assembles `CATALOG` by concatenating these
 * files in `GROUPS` order. Nothing imports this one directly.
 *
 * A group is the unit because an entry is prose, not a row — several paragraphs
 * per component — and ninety-two of them in one file is a file only one person can
 * be writing at a time.
 *
 * `Data` and `Charts` are split on one fact rather than on taste: nothing here
 * needs the `recharts` peer dependency, and everything under `Charts` does.
 */

/** @type {import('../catalog.mjs').CatalogEntry[]} */
export const DATA = [
  {
    name: 'Table',
    group: 'Data',
    summary: 'A ruled data table — alignment, sorting and rules all per column.',
    when: 'Alignment is per column and numbers belong at the end edge, so digits line up. Sorting is opt-in per column: a table where every header is a button invites sorting a column the data cannot be ordered by.',
    anatomy: [
      {
        element: 'Scroll region',
        required: true,
        description:
          'The focusable <div role="region"> around the table, named by caption. It carries the border setting and the density attribute, and it is what scrolls sideways — so the table exceeds the measure and the page does not. It is also positioned, which is what keeps an sr-only label inside a cell from resolving against the document and dragging the page sideways with it.',
      },
      {
        element: 'Caption',
        required: true,
        description:
          'A real <caption>, visually hidden unless showCaption prints it as an eyebrow above the table. The same string is the scroll region’s accessible name, so it is heard on the way in and again from the table.',
      },
      {
        element: 'Column label',
        required: true,
        description:
          'TH — mono and uppercase so it never reads as data, aligned per column, and always emitting scope="col" unless a call site overrides it.',
      },
      {
        element: 'Sort control',
        description:
          'On a sortable header only: a <button> INSIDE the th, with ArrowUp, ArrowDown or a dimmed ChevronsUpDown beside the label, and aria-sort on the th set from sortDirection.',
      },
      {
        element: 'Cells',
        required: true,
        description:
          'TD — top-aligned at --ink-2, sharing --table-pad-x with the header so the columns line up, and taking their row height from --table-pad-y, which density halves from 14px to 8px.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Bound the height from outside for stickyHeader: className and every other prop land on the <table>, not on the scrolling div around it, so only a constraining parent — a flex column with a height — gives that div something to stick within. A max-height on a plain wrapper does not, and the header simply travels with the page.',
      },
      {
        kind: 'do',
        text: 'Pass scope="row" on a row’s first cell — TH writes scope="col" and your props are spread after it, so the override lands; without it every row header claims to head a column and a cell traced back reaches the wrong label.',
      },
      {
        kind: 'do',
        text: 'Reset the other columns to sortDirection="none" when the sort moves: each header carries its own aria-sort and nothing coordinates them, so a table can end up announcing two columns as sorted at once.',
      },
      {
        kind: 'do',
        text: 'Give TD the same align as its TH — alignment is per cell, not inherited down the column, and end-aligned numbers under a start-aligned label is a column whose digits stop lining up with their own heading.',
      },
      {
        kind: 'dont',
        text: 'aria-sort tells a reader how the table is ordered once they reach the header; it announces nothing at the moment the button is pressed. A table that re-orders under a screen reader has to say so somewhere the reader already is, or every row silently changes and nothing is said.',
      },
      {
        kind: 'dont',
        text: 'Do not expect it to reflow on a phone: nothing stacks, the region scrolls sideways behind a hairline scrollbar, and a column past the fold is reachable only by a reader who works out that it scrolls. Eight columns at 375px wants a different presentation, not a smaller font.',
      },
    ],
    accessibility: [
      'caption is required: an unnamed table on a page with three tables is unnavigable.',
      'Column labels are <th scope="col">, so a cell can be traced back to its heading.',
      'A sortable header is a button INSIDE the th, not a click handler on the cell — a cell with an onClick is not focusable and not announced, so the sort would exist only for a mouse.',
      'aria-sort is set from sortDirection, which is the only way a screen reader learns the table is ordered at all.',
      'No zebra striping at any border setting: in a monochrome system a striped row is a second surface competing with the page ground.',
      'The scroll region is a containing block, so a visually-hidden label in a cell stays inside the table rather than escaping it and widening the page.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Reaches the scroll region, and each sortable column header.' },
      { keys: ['←', '→'], does: 'Scrolls the table sideways once the region has focus.' },
    ],
    related: ['card', 'figure-band'],
  },
  {
    name: 'Heatmap',
    group: 'Data',
    summary: 'A grid of values read by weight.',
    when: 'A calendar of activity, a confusion matrix, an hour-by-weekday load. The one form a monochrome system renders better than a chromatic one.',
    anatomy: [
      {
        element: 'Figure caption',
        required: true,
        description:
          'title in a figcaption, hidden from sight unless showTitle prints it above the grid with description under it. The same string is also the table’s own sr-only caption, so the grid is named on the way in and again from the table.',
      },
      {
        element: 'Column headers',
        required: true,
        description:
          'One th scope="col" per entry in columns, in the order given, preceded by an sr-only corner cell reading “Row” so the header line has something standing over the row labels.',
      },
      {
        element: 'Row headers',
        required: true,
        description:
          'One th scope="row" per entry in rows — end-aligned mono at --chart-axis, so every cell can be traced back to the pair of labels that names it.',
      },
      {
        element: 'Cell',
        required: true,
        description:
          'A td whose background is a color-mix of --series-1 into --chart-surface at the value’s position in the domain. Continuous rather than stepped, because banding a ramp invents boundaries the data does not have, and 2px of border-spacing between cells is what makes two neighbouring weights countable.',
      },
      {
        element: 'Missing cell',
        description:
          'What a null draws — and what a row and column pair absent from cells draws too: a dashed --rule outline over the page, announcing “no data” instead of a number.',
      },
      {
        element: 'Printed value',
        description:
          'formatValue inside the cell. Visible with showValues, otherwise sr-only and un-hidden again under forced colours, where the wash that WAS the encoding has been remapped away.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Switch scale to diverging the moment the values cross zero. sequential ramps on POSITION in the domain, so on a grid of changes the deepest fall is the palest cell and the biggest rise the darkest; diverging ramps on distance from the midpoint instead, which is the read a delta actually wants.',
      },
      {
        kind: 'do',
        text: 'Pin domain when one cell is an order of magnitude clear of the rest. The derived domain runs from zero — or the lowest value, when that is negative — to the highest, so a single 10,000 among readings of 5 to 40 puts every other cell inside the first half percent of the ramp, and forty distinct numbers render as one dark square on a blank grid.',
      },
      {
        kind: 'do',
        text: 'Spell a cell’s row and column exactly as they appear in rows and columns: cells are looked up by that pair, so an unmatched entry draws nothing at all. It no longer counts toward the derived domain either — a typo used to stretch the ramp with a value that appeared nowhere on the grid, pushing every drawn cell into the first fraction of it.',
      },
      {
        kind: 'do',
        text: 'Take the contrast trade knowingly when showValues goes on. The wash is capped at 35 percent of the ramp so one ink colour clears 4.5:1 on every cell — the ORDER of the cells survives untouched, the spread between them narrows, and the printed numbers become the thing carrying the detail.',
      },
      {
        kind: 'dont',
        text: 'Do not let a pipeline fill gaps with zero before the grid sees them. A null is drawn as a dashed outline and announced as no data, and a zero is drawn as the palest cell on the ramp — so substituting one for the other turns an outage into a quiet hour, and nothing on the grid says which it was.',
      },
      {
        kind: 'dont',
        text: 'Do not expect a reader to recover a figure from the wash. There is no legend and no step: weight orders the cells and never states one. The forced-colours fallback un-hides the numbers because the background has stopped existing there, which is a rescue for a remapped ground rather than a substitute for showValues on a grid whose exact figures matter.',
      },
    ],
    accessibility: [
      'A real <table>, not an SVG: the structure a screen reader walks is the structure the eye reads, and every cell announces its own row, column and value.',
      'Lightness is the only channel that is unambiguously ordered, which is why the standing advice everywhere else is “one hue, light to dark”. Here there is no hue left to get wrong.',
      'A null is drawn as a dashed outline, never as the palest cell — a missing reading is not a zero.',
      'Pin domain whenever two grids are compared: on independent domains they look alike and mean different things, which is the one failure a shared legend cannot fix.',
    ],
    related: ['table', 'scatter-chart'],
  },
  {
    name: 'Sparkline',
    group: 'Data',
    summary: 'A run of numbers at the size of a word.',
    when: 'In a table cell, beside a figure, at the end of a row. When the trend needs reading precisely it wants a LineChart and its own space.',
    anatomy: [
      {
        element: 'Inline row',
        required: true,
        description:
          'An inline-flex span, full width with 8px of gap, so the run sits in a table cell or beside a figure without breaking the line it is on.',
      },
      {
        element: 'Plot',
        required: true,
        description:
          'One svg role="img" over a 0–100 by 0–100 viewBox with preserveAspectRatio="none", so it stretches to whatever width the container gives it. height, 28px by default, is the only fixed dimension.',
      },
      {
        element: 'Mark',
        required: true,
        description:
          'The path, its area fill, or the bars — variant picks one. The stroke is drawn with non-scaling-stroke, which is what keeps the line the same weight in a narrow cell and a wide one after the box has been stretched to fit.',
      },
      {
        element: 'Last point',
        description:
          'A 2px dot on the final reading, from showLast, on the line and area variants. The bars variant carries the end of the run in its own last bar and draws no dot.',
      },
      {
        element: 'Printed value',
        description:
          'value, in mono tabular figures after the plot. It is also what the accessible name says after the label, and it is the only figure this component ever prints.',
      },
      {
        element: 'Too-short state',
        description:
          'What renders in place of the whole plot when fewer than two finite numbers survive: the label and “not enough data”, as one line of mono meta text.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass value whenever a figure matters. The plot has no axis and no scale, so it carries shape and nothing else, and value is both the one number printed and the reading appended to the accessible name. Left out, that name falls back to the last point through toLocaleString — the raw number, without the unit, the currency or the rounding the row beside it uses.',
      },
      {
        kind: 'do',
        text: 'Pin domain across any two that will be read against each other. Each run is normalised into the same fixed box from its OWN min and max, so the highest point always touches the top edge and the lowest always the floor: a series moving between 4 and 6 and a series moving between 400 and 900 draw the same silhouette, and the difference between them is drawn nowhere.',
      },
      {
        kind: 'do',
        text: 'Downsample a long run before handing it over. The x step is 100 divided by one less than the number of points, spread across whatever width the cell has, so four hundred readings in a 200px cell land half a pixel apart and the path fills in as a band.',
      },
      {
        kind: 'do',
        text: 'Read a flat line through the middle as “unchanged”, not as “at its floor”. A run whose min equals its max has a scale with no width, so no position on it is truer than another and every point sits at the centre — the same answer Heatmap and BulletChart give a zero span, and the one that keeps “unchanged” and “pinned at its worst” apart in a column of them.',
      },
      {
        kind: 'dont',
        text: 'Do not assume something chart-shaped always renders. Non-finite entries are filtered out first, and anything left under two points returns a line of text instead of an SVG, so the new account’s row is a sentence where every other row in the column is a chart.',
      },
    ],
    accessibility: [
      'label is required and is the whole accessible name: a sparkline has no axes and no legend, so nothing else describes it.',
      'Axis-less by design. Every piece of chrome that would let it answer “what value exactly” also makes it too big to sit inline, which was the only reason to reach for it.',
      'Pin domain for a column of them: on independent domains every row peaks and troughs identically, which is how a table of sparklines becomes actively misleading.',
      'One path, no rendering engine — so a hundred of them in a table cost nothing.',
    ],
    related: ['line-chart', 'table'],
  },
  {
    name: 'BarList',
    group: 'Data',
    summary: 'A ranked list, with the bar behind the name rather than beside it.',
    when: 'Top referrers, slowest endpoints, biggest accounts. A horizontal BarChart spends a third of its width on an axis repeating labels the rows could simply contain.',
    anatomy: [
      {
        element: 'Caption',
        required: true,
        description:
          'label, as the table’s real caption — sr-only unless showLabel prints it as an eyebrow above the rows. It is what names the list for a screen reader.',
      },
      {
        element: 'Header row',
        required: true,
        description:
          'An sr-only thead of two th scope="col" cells, Name and Value, so both columns are named even though the list never shows a header.',
      },
      {
        element: 'Name cell',
        required: true,
        description:
          'A th scope="row" holding the row’s name truncated to one line, with item.icon before it as aria-hidden decoration and item.href turning the name itself into the link.',
      },
      {
        element: 'Bar',
        required: true,
        description:
          'Not an element: a linear-gradient on the name cell’s inner span, a hard stop at the row’s share of the ceiling. Drawn as a sibling div it would be one more empty thing in the accessibility tree saying nothing.',
      },
      {
        element: 'Value cell',
        required: true,
        description:
          'A td at the end edge in mono tabular figures at --ink-2, written by formatValue — the same compact default the axes use unless the call site replaces it.',
      },
      {
        element: 'Other row',
        description:
          'What limit adds: one final row named Other carrying the summed tail, so the rows shown still account for the whole they were cut from.',
      },
      {
        element: 'Empty state',
        description:
          'ChartEmpty under the label when there is nothing to rank. A caption over an empty tbody is a list that failed to load as far as the reader can tell, and reloading does not change it.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pin max when rows arrive over time. The ceiling is the largest row currently shown, so one new leader rescales every bar under it — a track that was two thirds full yesterday is a quarter full today with exactly the same number in it, and the movement the reader sees happened to a different row.',
      },
      {
        kind: 'do',
        text: 'Reach for limit rather than slicing items at the call site. The tail is summed into the Other row instead of being dropped, so the five rows shown still add up to the whole; a top five cut by hand discards the other forty silently, and nothing in the list says so.',
      },
      {
        kind: 'do',
        text: 'Keep names short enough to survive the truncation. The name is a single truncated line sharing its width with the value column, so two endpoints that differ only past the fortieth character render as the same row with the same ellipsis.',
      },
      {
        kind: 'do',
        text: 'Pass sort={false} when the order is the point — a funnel, a set of steps, a fixed set of regions. sort defaults to true and orders descending, which turns a sequence into a ranking without saying that it did.',
      },
      {
        kind: 'dont',
        text: 'The bar is the row over the largest row, never a share of a total: the leading row always fills its track, so five rows that make up 3 percent of traffic look exactly like five that make up all of it. Where the whole matters, the caption is where it goes.',
      },
      {
        kind: 'dont',
        text: 'Do not mix number shapes down the value column. It is end-aligned mono with tabular figures, which lines digits up only while the strings are the same shape — and the default formatter switches to the compact form at 10,000, so a list spanning that threshold puts 9,400 under 1.2M and there is nothing left to compare down.',
      },
      {
        kind: 'dont',
        text: 'Two rows cannot share a name. It is the row’s label and its React key at once, so a list built from a query that can repeat a label renders duplicate keys, which React warns about and reconciles wrongly the moment the list updates.',
      },
    ],
    accessibility: [
      'A real <table> with two columns and one row per thing, because that is what a ranked list is. The bar is a background on the name cell, so it is never a second element a screen reader has to walk past.',
      'limit sums the tail into an “Other” row rather than dropping it — a top five that silently discards the other forty misstates the whole, and the reader has no way to tell.',
      'Pin max to compare two lists side by side: on independent scales the leading row of each fills its track, and two very different numbers look identical.',
    ],
    related: ['bar-chart', 'table'],
  },
  {
    name: 'BigNumber',
    group: 'Data',
    summary: 'One number, at the size of a headline.',
    when: 'There is exactly one figure to report. A plot of a single value is a plot whose shape carries nothing, and the reader has to decode an axis to recover a number that could simply have been printed.',
    anatomy: [
      {
        element: 'Label',
        required: true,
        description:
          'What the number counts, as an eyebrow at --ink-3-aa above it. Nothing binds it to the value programmatically — no aria-labelledby, no role — so document order is the whole association.',
      },
      {
        element: 'Value',
        required: true,
        description:
          'The number itself, in the editorial face at --fs-lead with tabular figures. Rendered exactly as handed over: no unit, currency or locale is guessed on its behalf.',
      },
      {
        element: 'Delta',
        description:
          'The line under the number, from delta: the change through format — a signed percentage unless replaced — and delta.label at --ink-3-aa saying what it is a change from.',
      },
      {
        element: 'Direction mark',
        description:
          'Inside the delta: an aria-hidden arrow, up, down or flat at zero, and the status tint, --ok or --danger, or --ink-2 while nothing has been judged. Two carriers, so the reading survives greyscale and forced colours.',
      },
      {
        element: 'Verdict',
        description:
          'The sr-only words beside the arrow — up or down, then better or worse once intent has been set. It is what a screen reader gets in place of the tint.',
      },
      {
        element: 'Note slot',
        description:
          'children, under the number with a margin: where a Sparkline, a denominator or a caveat goes.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Give the figure something to be judged against. On its own a number cannot be read — 48,210 is neither good nor bad until it is beside last month — and this component carries exactly two places for that: delta for one comparison, children for the Sparkline or the denominator under it.',
      },
      {
        kind: 'do',
        text: 'Pass delta.value as a ratio. The default formatter multiplies by a hundred and prefixes the sign, so 0.124 prints as +12.4% and 12.4 prints as +1240%. A change already expressed in points needs its own format handed over with it.',
      },
      {
        kind: 'do',
        text: 'Set intent on any delta meant to be coloured. It defaults to neutral, which renders the change at --ink-2 and says only which way it moved — correct for a figure nobody has judged, and rarely what the author of a revenue card thought they had written.',
      },
      {
        kind: 'do',
        text: 'Let value be null when there is no reading. It prints an em dash at --ink-3-aa with an sr-only “No data” behind it, which is a number nobody has; a blank line under a label is a broken layout as far as the reader can tell. emptyValue changes what the dash is.',
      },
      {
        kind: 'dont',
        text: 'Do not expect a delta of exactly zero to carry the intent’s verdict. There is no direction for an intent to judge, so the tone, the arrow and the announced words all say “no change” and stop — a zero under up-is-good used to be announced as “no change, worse” while the page showed no judgement at all.',
      },
      {
        kind: 'dont',
        text: 'Do not separate the label from the number. The value is text in a span rather than a labelled element, and the label is a sibling read before it, so a layout that moves the figure into its own column — or reuses one label over two figures — hands a screen reader a bare number with nothing naming it.',
      },
    ],
    accessibility: [
      'The delta’s direction is stated by the call site through intent, never inferred from the sign: “errors down 12%” is good news and “revenue down 12%” is not, and no component can tell which it is holding.',
      'The arrow and the words carry the direction; the status tint is the third signal, never the only one — so the reading survives greyscale, forced colours and colour blindness.',
      'value is taken already formatted. The component does not guess a unit, a currency or a locale.',
    ],
    related: ['sparkline', 'figure-band'],
  },
  {
    name: 'BulletChart',
    group: 'Data',
    summary: 'A measure, its target, and the bands that say whether it is any good.',
    when: 'A status page of ten tracked numbers. Stephen Few designed it to replace the dashboard gauge, which spends a whole card saying one number badly.',
    anatomy: [
      {
        element: 'Figure caption',
        required: true,
        description:
          'title on the shared chart figure, referenced by aria-labelledby rather than left to be inferred from the figcaption, and hidden from sight unless showTitle prints it with description beneath.',
      },
      {
        element: 'Measure line',
        required: true,
        description:
          'The row above each track: the measure’s name with its optional detail at the start, the formatted value at the end, and the target after a slash where there is one. This line is the reading a screen reader gets, because the graphic under it is not in the accessibility tree at all.',
      },
      {
        element: 'Track',
        required: true,
        description:
          'The 24px aria-hidden box holding the bands, the bar and the target rule, laid out with inline-axis offsets rather than in SVG user space — which is what makes the whole chart mirror correctly in a right-to-left document.',
      },
      {
        element: 'Bands',
        description:
          'The qualitative ground, built from ranges as ascending upper bounds: heaviest at the low end of the scale and lightening as it rises, so the solid bar stands out most where performance is best.',
      },
      {
        element: 'Measure bar',
        required: true,
        description:
          'The value, solid --series-1 at a third of the track’s height, running from the start of the scale. The one mark here that is a measurement rather than a judgement, and the only one drawn at full weight.',
      },
      {
        element: 'Target rule',
        description:
          'target, as a 2px rule of --ink straight across the bar rather than a second bar beside it — so which number was achieved and which was asked for is a glance rather than a comparison.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Keep every range bound inside the domain. Bounds at or outside the two ends have no boundary to draw and are dropped before the bands are built, so ranges of 60 and 80 on a domain of 0 to 50 draws one flat band — the row LOOKS evaluated and is not. They stay in the table’s range-bounds cell, which is the only place the mismatch is visible.',
      },
      {
        kind: 'do',
        text: 'Hold to five bands. The weights are spread evenly from the full --chart-fill down to three tenths of it across however many bands are passed, so a sixth and a seventh boundary only slice that same span thinner and the ground stops having edges a reader can read a threshold off.',
      },
      {
        kind: 'do',
        text: 'Leave hideDataTable off unless the page prints the measures itself. The whole graphic is aria-hidden — bands, bar and target alike — so the generated sr-only table of value, target and range bounds is the only account of the chart a screen reader ever reaches.',
      },
      {
        kind: 'dont',
        text: 'A value past the end of the scale is clamped, not overflowed: 130 on a domain of 0 to 100 fills the track exactly as 100 does. A notch at the end of the track says it happened and the figure printed above says by how much — but the track itself cannot, so pin domain wide enough for the overshoot you expect rather than reading the row that blew through its target as one that merely finished.',
      },
      {
        kind: 'dont',
        text: 'Do not put a range bound on the target. Both are placed by the same scale, so the rule lands exactly on a band edge and the one mark that says what was ASKED for disappears into the ground it was meant to be read against.',
      },
    ],
    accessibility: [
      'Plain HTML with logical properties — no rendering engine, server-renderable, and correct in a right-to-left document. Usable with recharts absent.',
      'The bands are a JUDGEMENT drawn in the same ink as the measurement, so the page has to say where they came from. Ranges that encode nothing but thirds make the chart look evaluated when it is not.',
      'It shows one instant and no change over time; target is the only comparison it carries. “How did we get here” wants a LineChart.',
      'Shared bands only mean something when the measures share a scale — a latency beside a conversion rate needs ranges and domain per measure.',
    ],
    related: ['bar-list', 'big-number'],
  },
]
