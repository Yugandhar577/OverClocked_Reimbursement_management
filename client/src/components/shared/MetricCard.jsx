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
  return (
    <div className={className}>
      <Card
        className={cn(
          'relative overflow-hidden rounded-md border border-[#ebe7ea] bg-[#fbfbfc] px-4 py-4 shadow-soft before:absolute before:inset-y-4 before:left-0 before:w-1 before:rounded-full',
          toneClasses[tone],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
              {label}
            </p>
            <p className="text-[1.85rem] font-semibold tracking-[-0.05em] text-ink-950">
              {value}
            </p>
            {note ? <p className="text-sm text-ink-600">{note}</p> : null}
          </div>
          <div className="flex flex-col items-end gap-3">
            {Icon ? (
              <div className="rounded-md bg-white p-2.5 text-brand-800 shadow-soft">
                <Icon className="h-4 w-4" />
              </div>
            ) : null}
            {trend ? (
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-700 shadow-soft">
                {trend}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  )
}
