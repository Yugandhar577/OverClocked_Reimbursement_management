import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../../utils/cn.js'

export function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-brand-100 bg-[#e6dfdf] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30 data-[state=checked]:bg-aqua-600',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 translate-x-1 rounded-full bg-white shadow-md transition-transform duration-200 data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  )
}
