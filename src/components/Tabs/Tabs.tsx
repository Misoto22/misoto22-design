'use client'

import { clsx } from 'clsx'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'

/** Radix Tabs root, re-exported as a typed passthrough. */
export const Tabs = TabsPrimitive.Root

/**
 * Underlined tab strip with an accent active marker.
 *
 * @example
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">Overview</TabsTrigger>
 *     <TabsTrigger value="activity">Activity</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">Overview panel</TabsContent>
 *   <TabsContent value="activity">Activity panel</TabsContent>
 * </Tabs>
 */
export function TabsList({ className, ...rest }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={clsx('inline-flex items-center gap-1 border-b border-(--border-color)', className)}
      {...rest}
    />
  )
}

/** Single tab button; turns accent-colored with an underline when active. */
export function TabsTrigger({
  className,
  ...rest
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={clsx(
        'px-3.5 py-2 text-sm text-(--secondary-text) border-b-2 border-transparent -mb-px transition-colors hover:text-(--foreground) data-[state=active]:text-(--accent) data-[state=active]:border-(--accent) outline-none',
        className,
      )}
      {...rest}
    />
  )
}

/** Panel paired to a {@link TabsTrigger} by matching `value`. */
export function TabsContent({
  className,
  ...rest
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content className={clsx('pt-4 outline-none', className)} {...rest} />
  )
}

export default Tabs
