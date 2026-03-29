import { CalendarDays, ChevronRight, Paperclip } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../shared/StatusBadge.jsx'
import { CurrencyDisplay } from './CurrencyDisplay.jsx'
import { toUiExpenseStatus } from '../../api/transformers.js'

export function ExpenseCard({ expense, to }) {
  const receiptCount = expense._count?.receipts ?? expense.receipts?.length ?? 0

  return (
    <Link
      className="surface-card block p-4 transition hover:-translate-y-0.5 hover:shadow-float"
      to={to}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold tracking-[-0.04em] text-ink-950">
            {expense.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-600">
            {expense.description || expense.category?.name || 'No description yet.'}
          </p>
        </div>

        <div className="text-right">
          <CurrencyDisplay
            amount={expense.convertedAmount ?? expense.totalAmount}
            currency={expense.currency}
            className="block font-display text-xl font-black tracking-[-0.04em] text-ink-950"
          />
          <div className="mt-2">
            <StatusBadge status={toUiExpenseStatus(expense)} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand-600" />
          {new Date(expense.expenseDate ?? expense.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
        <span className="inline-flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-aqua-600" />
          {receiptCount} receipt{receiptCount === 1 ? '' : 's'}
        </span>
        <ChevronRight className="h-4 w-4 text-ink-400" />
      </div>
    </Link>
  )
}
