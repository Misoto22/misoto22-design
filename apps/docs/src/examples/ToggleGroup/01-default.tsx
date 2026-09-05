'use client'

import { ToggleGroup, ToggleGroupItem } from '@misoto22/design'

export function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ToggleGroup type="single" defaultValue="grid" aria-label="Layout">
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="map">Map</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={['film']} aria-label="Formats">
        <ToggleGroupItem value="film">Film</ToggleGroupItem>
        <ToggleGroupItem value="digital">Digital</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
