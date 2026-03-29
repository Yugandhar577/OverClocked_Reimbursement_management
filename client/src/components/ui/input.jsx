import { cn } from '../../utils/cn.js'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-950 transition-colors placeholder:text-ink-400 focus:border-brand-600/40 focus:outline-none focus:ring-2 focus:ring-brand-600/15',
        className,
      )}
      {...props}
    />
  )
}
