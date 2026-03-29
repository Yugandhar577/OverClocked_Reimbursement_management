import { Check, Dot } from 'lucide-react'
import { cn } from '../../utils/cn.js'

const steps = ['Draft', 'Submitted', 'Approved', 'Paid']

function toStepIndex(expense) {
  if (expense.paymentStatus === 'PAID' || expense.status === 'DONE') return 3
  if (expense.status === 'APPROVED') return 2
  if (expense.status === 'SUBMITTED') return 1
  return 0
}

export function StatusPipeline({ expense }) {
  const activeIndex = toStepIndex(expense)

  return (
    <div className="surface-soft p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Status Pipeline</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const complete = index <= activeIndex

          return (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                  complete
                    ? 'border-brand-900 bg-brand-900 text-white'
                    : 'border-line bg-white text-ink-400',
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : <Dot className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <p className={cn('truncate text-xs font-semibold', complete ? 'text-brand-900' : 'text-ink-500')}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 ? (
                <div className={cn('h-[2px] flex-1 rounded-full', complete ? 'bg-brand-400' : 'bg-line')} />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
