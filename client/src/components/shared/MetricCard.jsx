import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '../ui/card.jsx'
import { cn } from '../../utils/cn.js'

const toneClasses = {
  aqua: 'before:bg-aqua-500',
  amber: 'before:bg-amber-500',
  brand: 'before:bg-brand-700',
  neutral: 'before:bg-ink-400',
  danger: 'before:bg-red-500',
  soft: 'before:bg-brand-200',
}

export function MetricCard({
  label,
  value,
  note,
  trend,
  tone = 'brand',
  icon: Icon,
  className,
}) {
  const prefersReducedMotion = useReducedMotion()
  const Wrapper = prefersReducedMotion ? 'div' : motion.div

  return (
    <Wrapper
      className={className}
      {...(!prefersReducedMotion
        ? {
            whileHover: {
              y: -4,
              transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
            },
          }
        : {})}
    >
      <Card
        className={cn(
          'relative overflow-hidden rounded-[26px] border border-white/80 bg-white px-6 py-5 before:absolute before:inset-y-6 before:left-0 before:w-1 before:rounded-full',
          toneClasses[tone],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-500">
              {label}
            </p>
            <p className="font-display text-[2rem] font-black tracking-[-0.05em] text-ink-950">
              {value}
            </p>
            {note ? <p className="text-sm text-ink-600">{note}</p> : null}
          </div>
          <div className="flex flex-col items-end gap-3">
            {Icon ? (
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
            {trend ? (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-800">
                {trend}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Wrapper>
  )
}
