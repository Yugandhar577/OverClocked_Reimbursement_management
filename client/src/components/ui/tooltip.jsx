import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../utils/cn.js'

export function TooltipProvider({ ...props }) {
  return <TooltipPrimitive.Provider delayDuration={120} {...props} />
}

export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({ className, sideOffset = 10, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 rounded-xl bg-brand-950 px-3 py-2 text-xs font-medium text-white shadow-soft',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
