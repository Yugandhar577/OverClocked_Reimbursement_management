import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../utils/cn.js'

export const Tabs = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex rounded-2xl bg-brand-50 p-1 text-sm', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-xl px-4 py-2 font-semibold text-ink-700 transition data-[state=active]:bg-white data-[state=active]:text-brand-900 data-[state=active]:shadow-soft',
        className,
      )}
      {...props}
    />
  )
}
