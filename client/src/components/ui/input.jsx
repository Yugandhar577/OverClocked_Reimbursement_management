import { cn } from '../../utils/cn.js'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink-950 shadow-soft transition-all placeholder:text-ink-400 focus:border-brand-600/40 focus:outline-none focus:ring-2 focus:ring-brand-600/15',
        className,
      )}
      {...props}
    />
  )
}
