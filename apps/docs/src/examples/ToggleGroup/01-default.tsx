'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="m-0 eyebrow text-(--ink-3-aa)">single — one of these</p>
        <ToggleGroup type="single" defaultValue="grid" aria-label="Layout">
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="map">Map</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <p className="m-0 eyebrow text-(--ink-3-aa)">multiple — any of these</p>
        <ToggleGroup type="multiple" defaultValue={['film']} aria-label="Formats">
          <ToggleGroupItem value="film">Film</ToggleGroupItem>
          <ToggleGroupItem value="digital">Digital</ToggleGroupItem>
          <ToggleGroupItem value="scan">Scan</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
