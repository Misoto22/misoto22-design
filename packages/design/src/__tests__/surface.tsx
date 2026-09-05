import { Copy, Inbox, Settings, Trash2 } from 'lucide-react'
import type { ReactElement } from 'react'
import {
  Accordion,
  AccordionItem,
  Alert,
  AppShell,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CollapsibleSection,
  Combobox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DatePicker,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ERROR_ACTION_CLASS,
  ErrorState,
  Field,
  FigureBand,
  FloatingIconButton,
  Input,
  Kbd,
  LinkArrow,
  NavItem,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Select,
  Separator,
  Sheet,
  SheetContent,
  SheetTrigger,
  Slider,
  SkeletonBlock,
  SkeletonLine,
  SkeletonPage,
  Spinner,
  StatusDot,
  StatusPill,
  Switch,
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
  Tag,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
  Toaster,
  Tooltip,
  TooltipProvider,
} from '../index'

/**
 * One representative render per component, in a shape a real call site would
 * use — a labelled control, a table with a caption, a dialog that is open.
 *
 * This is the fixture three suites share: the axe pass, the server-render pass,
 * and the keyboard pass. That is the point. Thirty-six near-identical test
 * files would each have drifted into testing something slightly different;
 * one fixture means "every component is checked" is a property the repository
 * can enforce rather than a claim a reviewer has to audit.
 *
 * `coverage.test.ts` fails when a component directory has no entry here, so a
 * new component cannot land untested.
 */
export interface SurfaceEntry {
  /** The directory under src/components. Keyed to the coverage check. */
  dir: string
  render: () => ReactElement
  /**
   * Components whose visible surface only exists once opened. The axe pass
   * opens them first; the server-render pass skips their trigger-only markup.
   */
  opensWith?: string
  /**
   * Axe rules this fixture cannot satisfy in isolation, with the reason. An
   * empty list is the default and the goal; every entry here is a promise that
   * the rule is satisfied by the CALL SITE, and the docs page for the component
   * says so.
   */
  axeExceptions?: { rule: string; because: string }[]
}

export const SURFACE: SurfaceEntry[] = [
  { dir: 'Accordion', render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="a" title="How do I install it?">Add the package.</AccordionItem>
      <AccordionItem value="b" title="Do I need Tailwind?">No.</AccordionItem>
    </Accordion>
  ) },
  { dir: 'Alert', render: () => (
    <Alert tone="danger" title="Upload failed">The file exceeds 25 MB.</Alert>
  ) },
  { dir: 'AppShell', render: () => (
    <AppShell brand={<span>Console</span>} sidebar={<NavItem href="#home">Overview</NavItem>}>
      <p>Content</p>
    </AppShell>
  ) },
  { dir: 'Avatar', render: () => <Avatar alt="Henry Chen" fallback="HC" /> },
  { dir: 'Badge', render: () => <Badge tone="success">Deployed</Badge> },
  { dir: 'Breadcrumb', render: () => (
    <Breadcrumb items={[{ label: 'Home', href: '#/' }, { label: 'Button' }]} />
  ) },
  { dir: 'Button', render: () => <Button keycap="P">View projects</Button> },
  { dir: 'Card', render: () => (
    <Card>
      <CardHeader><CardTitle>Recent deploys</CardTitle><Badge>12</Badge></CardHeader>
      <CardBody>Twelve releases, none rolled back.</CardBody>
      <CardFooter>Updated just now</CardFooter>
    </Card>
  ) },
  { dir: 'Checkbox', render: () => (
    <label><Checkbox defaultChecked /> Ship on merge</label>
  ) },
  { dir: 'Dialog', opensWith: 'Delete frame', render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Delete frame</Button></DialogTrigger>
      <DialogContent title="Delete this frame?" description="This cannot be undone.">
        <Button variant="secondary">Cancel</Button>
      </DialogContent>
    </Dialog>
  ) },
  { dir: 'DropdownMenu', opensWith: 'Account', render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="secondary">Account</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Signed in</DropdownMenuLabel>
        <DropdownMenuItem icon={Settings}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Trash2} destructive>Delete account</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) },
  { dir: 'EmptyState', render: () => (
    <EmptyState icon={Inbox} title="No projects yet" description="Create one to get started." />
  ) },
  { dir: 'ErrorState', render: () => (
    <ErrorState
      code="404"
      heading="Page not found"
      message="It may have moved."
      action={<a href="#/" className={ERROR_ACTION_CLASS}>Back home</a>}
    />
  ) },
  { dir: 'Field', render: () => (
    <Field label="Email" required hint="We never share it."><Input type="email" /></Field>
  ) },
  { dir: 'FigureBand', render: () => (
    <FigureBand
      label="At a glance"
      figures={[
        { id: 'a', label: 'Releases', value: '12' },
        { id: 'b', label: 'Rollbacks', value: '0', note: 'this quarter' },
      ]}
    />
  ) },
  { dir: 'FloatingIconButton', render: () => (
    <FloatingIconButton position="end" label="Back to top"><span aria-hidden>↑</span></FloatingIconButton>
  ) },
  { dir: 'Input', render: () => <Field label="Search"><Input type="search" /></Field> },
  { dir: 'Kbd', render: () => <p>Press <Kbd>⌘</Kbd> <Kbd>K</Kbd></p> },
  { dir: 'LinkArrow', render: () => <a href="#x">Read the paper<LinkArrow /></a> },
  { dir: 'NavItem', render: () => (
    <nav aria-label="Primary"><NavItem href="#work" active>Work</NavItem></nav>
  ) },
  { dir: 'Pagination', render: () => (
    <Pagination page={7} pageCount={20} onPageChange={() => {}} />
  ) },
  { dir: 'Progress', render: () => <Progress value={62} label="Uploading photos" showValue /> },
  { dir: 'RadioGroup', render: () => (
    <RadioGroup defaultValue="light" aria-label="Appearance">
      <RadioGroupItem value="light">Light</RadioGroupItem>
      <RadioGroupItem value="dark">Dark</RadioGroupItem>
    </RadioGroup>
  ) },
  { dir: 'Select', render: () => (
    <Field label="Region">
      <Select defaultValue="au"><option value="au">Australia</option></Select>
    </Field>
  ) },
  { dir: 'Separator', render: () => <Separator /> },
  { dir: 'Skeleton', render: () => (
    <SkeletonPage label="Loading projects">
      <SkeletonLine className="w-40" />
      <SkeletonBlock className="h-20" />
    </SkeletonPage>
  ) },
  { dir: 'Spinner', render: () => <Spinner label="Loading projects" /> },
  { dir: 'StatusDot', render: () => <span><StatusDot /> Available</span> },
  { dir: 'StatusPill', render: () => <StatusPill>Available for work</StatusPill> },
  { dir: 'Switch', render: () => (
    <label><Switch defaultChecked /> Email notifications</label>
  ) },
  { dir: 'Table', render: () => (
    <Table caption="Recent deploys">
      <THead><TR><TH>Commit</TH><TH>Duration</TH></TR></THead>
      <TBody><TR><TD>a1b2c3d</TD><TD>2m 14s</TD></TR></TBody>
    </Table>
  ) },
  { dir: 'Tabs', render: () => (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">The rendered component.</TabsContent>
      <TabsContent value="code">The source.</TabsContent>
    </Tabs>
  ) },
  { dir: 'Tag', render: () => <Tag>TypeScript</Tag> },
  { dir: 'Textarea', render: () => <Field label="Notes"><Textarea rows={3} /></Field> },
  { dir: 'Toast', render: () => <Toaster /> },
  { dir: 'Calendar', render: () => <Calendar mode="single" defaultMonth={new Date(2026, 0, 1)} /> },
  { dir: 'Collapsible', render: () => (
    <CollapsibleSection title="Advanced settings">
      <p>Nothing here needs changing.</p>
    </CollapsibleSection>
  ) },
  { dir: 'Combobox', render: () => (
    <Combobox
      label="Framework"
      options={[
        { value: 'next', label: 'Next.js' },
        { value: 'remix', label: 'Remix' },
      ]}
    />
  ) },
  { dir: 'Command', render: () => (
    <Command label="Command palette">
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem value="components" shortcut="C">Components</CommandItem>
          <CommandItem value="principles">Principles</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ) },
  { dir: 'ContextMenu', render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>Right-click me</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={Copy}>Copy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ) },
  { dir: 'DatePicker', render: () => <DatePicker label="Publish on" /> },
  { dir: 'Popover', opensWith: 'Filters', render: () => (
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary">Filters</Button></PopoverTrigger>
      <PopoverContent label="Filters">
        <Field label="Status"><Input /></Field>
      </PopoverContent>
    </Popover>
  ) },
  { dir: 'ScrollArea', render: () => (
    <ScrollArea label="Deploy log" className="h-24 w-64">
      <p>a1b2c3d deployed</p>
      <p>9f8e7d6 deployed</p>
    </ScrollArea>
  ) },
  { dir: 'Sheet', opensWith: 'Open filters', render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="secondary">Open filters</Button></SheetTrigger>
      <SheetContent title="Filters" description="Narrow the list.">
        <Field label="Status"><Input /></Field>
      </SheetContent>
    </Sheet>
  ) },
  { dir: 'Slider', render: () => (
    <Slider label="Quality" defaultValue={[80]} max={100} step={5} showValue />
  ) },
  { dir: 'ToggleGroup', render: () => (
    <ToggleGroup type="single" defaultValue="grid" aria-label="Layout">
      <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem value="list">List</ToggleGroupItem>
    </ToggleGroup>
  ) },
  { dir: 'Tooltip', opensWith: 'Copy', render: () => (
    <TooltipProvider>
      <Tooltip content="Copy to clipboard">
        <Button iconOnly aria-label="Copy"><span aria-hidden>⧉</span></Button>
      </Tooltip>
    </TooltipProvider>
  ) },
]

export const SURFACE_BY_DIR = new Map(SURFACE.map((entry) => [entry.dir, entry]))
