import { cn } from '../../utils/cn.js'

export function Card({ className, ...props }) {
  return <section className={cn('surface-card', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <header className={cn('flex flex-col gap-2', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'font-display text-lg font-bold tracking-[-0.03em] text-ink-950',
        className,
      )}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm leading-6 text-ink-700', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('text-sm text-ink-700', className)} {...props} />
}
