import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../../utils/cn.js'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export function DropdownMenuContent({ className, sideOffset = 10, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          'z-50 min-w-[12rem] rounded-2xl border border-white/80 bg-white p-2 shadow-float',
          className,
        )}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center rounded-xl px-3 py-2 text-sm text-ink-700 outline-none transition hover:bg-brand-50 focus:bg-brand-50',
        className,
      )}
      {...props}
    />
  )
}
