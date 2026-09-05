import { Badge, Card, CardBody, CardFooter, CardHeader, CardTitle } from '@misoto22/design'

export function Example() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent deploys</CardTitle>
          <Badge tone="success">green</Badge>
        </CardHeader>
        <CardBody>Twelve releases in the last thirty days, none rolled back.</CardBody>
        <CardFooter>Updated 4 minutes ago</CardFooter>
      </Card>
      <Card variant="plate">
        <CardHeader className="border-(--ink-3)">
          <CardTitle className="text-(--on-feature)">The reversed plate</CardTitle>
        </CardHeader>
        <CardBody className="text-(--on-feature)/80">
          One per screen. It separates by reversal, because this system has no blur to raise it with.
        </CardBody>
      </Card>
    </div>
  )
}
