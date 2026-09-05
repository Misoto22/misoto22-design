'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@misoto22/design'

export function Example() {
  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="props">Props</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="text-sm text-(--ink-2)">The rendered component.</TabsContent>
      <TabsContent value="code" className="text-sm text-(--ink-2)">The source that produced it.</TabsContent>
      <TabsContent value="props" className="text-sm text-(--ink-2)">Its parsed prop table.</TabsContent>
    </Tabs>
  )
}
