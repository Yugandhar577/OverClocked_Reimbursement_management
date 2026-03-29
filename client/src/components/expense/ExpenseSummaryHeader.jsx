import { ArrowRight } from 'lucide-react'
import { CurrencyDisplay } from './CurrencyDisplay.jsx'

function totalFor(items, predicate) {
  return items
    .filter(predicate)
    .reduce((sum, item) => sum + Number(item.convertedAmount ?? item.totalAmount ?? 0), 0)
}

export function ExpenseSummaryHeader({ expenses }) {
  const draftTotal = totalFor(expenses, (item) => item.status === 'DRAFT' || item.status === 'TO_SUBMIT')
  const reviewTotal = totalFor(expenses, (item) => item.status === 'SUBMITTED')
  const reimburseTotal = totalFor(
    expenses,
    (item) => item.status === 'APPROVED' || item.paymentStatus === 'IN_PAYMENT' || item.paymentStatus === 'PAID',
  )

  const stats = [
    { label: 'To submit', value: draftTotal },
    { label: 'Under validation', value: reviewTotal },
    { label: 'To reimburse', value: reimburseTotal },
  ]

  return (
    <section className="surface-card mb-5 overflow-hidden p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Momentum</p>
          <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
            Claim flow
          </h2>
        </div>
        <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
          {expenses.length} total
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {stats.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-[22px] bg-gradient-to-r from-white to-brand-50/70 px-4 py-3 shadow-soft"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{item.label}</p>
              <CurrencyDisplay
                amount={item.value}
                className="mt-1 block font-display text-2xl font-black tracking-[-0.04em] text-ink-950"
              />
            </div>
            {index < stats.length - 1 ? (
              <ArrowRight className="h-5 w-5 text-brand-500" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-aqua-500" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
