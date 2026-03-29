import { cn } from '../../utils/cn.js'

const steps = ['To Report', 'To Submit', 'Submitted', 'Approved', 'Done']

function toStepIndex(expense) {
  if (expense.paymentStatus === 'PAID' || expense.status === 'DONE') return 4
  if (expense.status === 'APPROVED') return 3
  if (expense.status === 'SUBMITTED') return 2
  if (expense.status === 'TO_SUBMIT') return 1
  return 0
}

export function StatusPipeline({ expense }) {
  const activeIndex = toStepIndex(expense)

  return (
    <div className="flex flex-wrap items-center gap-0 overflow-hidden rounded-md border border-line bg-white">
      {steps.map((step, index) => {
        const active = index === activeIndex
        const complete = index < activeIndex

        return (
          <div
            key={step}
            className={cn(
              'relative flex h-10 items-center px-5 text-sm font-medium',
              index < steps.length - 1 && 'pr-8',
              active
                ? 'bg-[#edf7f7] text-[#2f666d]'
                : complete
                  ? 'bg-[#f2f3f6] text-ink-700'
                  : 'bg-[#f5f6f8] text-ink-500',
            )}
          >
            <span>{step}</span>
            {index < steps.length - 1 ? (
              <>
                <span className="absolute right-0 top-0 h-10 w-10 translate-x-1/2 rotate-45 border-r border-t border-line bg-inherit" />
                <span className="absolute right-0 top-0 h-10 w-10 translate-x-[calc(50%-1px)] rotate-45 bg-transparent" />
              </>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
