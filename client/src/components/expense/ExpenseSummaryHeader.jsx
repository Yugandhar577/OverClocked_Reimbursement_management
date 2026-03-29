import { ChevronRight } from 'lucide-react'
import { CurrencyDisplay } from './CurrencyDisplay.jsx'

function totalFor(items, predicate) {
  return items
    .filter(predicate)
    .reduce((sum, item) => sum + Number(item.convertedAmount ?? item.totalAmount ?? 0), 0)
}

export function ExpenseSummaryHeader({ expenses }) {
  const draftTotal = totalFor(
    expenses,
    (item) => item.status === 'DRAFT' || item.status === 'TO_SUBMIT',
  )
  const reviewTotal = totalFor(expenses, (item) => item.status === 'SUBMITTED')
  const reimburseTotal = totalFor(
    expenses,
    (item) =>
      item.status === 'APPROVED' ||
      item.paymentStatus === 'IN_PAYMENT' ||
      item.paymentStatus === 'PAID',
  )

  const stats = [
    { label: 'to submit', value: draftTotal },
    { label: 'under validation', value: reviewTotal },
    { label: 'to be reimbursed', value: reimburseTotal },
  ]

  return (
    <section className="odoo-panel overflow-hidden">
      <div className="grid gap-px bg-line lg:grid-cols-[1fr_60px_1fr_60px_1fr]">
        {stats.map((item, index) => (
          <div key={item.label} className="contents">
            <div className="odoo-kpi flex-col">
              <CurrencyDisplay
                amount={item.value}
                className="block text-[2rem] font-semibold tracking-[-0.05em] text-[#64445a]"
              />
              <p className="mt-1 text-[1.02rem] font-semibold leading-none text-ink-800">
                {item.label}
              </p>
            </div>
            {index < stats.length - 1 ? (
              <div className="odoo-kpi !bg-[#fbfcfd]">
                <ChevronRight className="h-7 w-7 text-ink-500" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
