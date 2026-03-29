import { cn } from '../../utils/cn.js'

export function AvatarBadge({
  initials,
  toneClass = 'bg-brand-100 text-brand-800',
  className,
}) {
  return (
    <div
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold uppercase tracking-[0.2em]',
        toneClass,
        className,
      )}
    >
      {initials}
    </div>
  )
}
