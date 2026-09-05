import { NavItem } from '@misoto22/design'
import { Component, Palette, Type } from 'lucide-react'

export function Example() {
  return (
    <nav className="flex w-56 flex-col gap-1" aria-label="Example">
      <NavItem href="#" icon={Component} active>Components</NavItem>
      <NavItem href="#" icon={Palette}>Colour</NavItem>
      <NavItem href="#" icon={Type}>Typography</NavItem>
    </nav>
  )
}
