import { Pencil, Trash2 } from 'lucide-react'
import { CurrencyDisplay } from './CurrencyDisplay.jsx'

export function ExpenseLineItem({ line, onEdit, onDelete }) {
  return (
    <div className="rounded-[22px] border border-line bg-white px-4 py-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-950">{line.description}</p>
          <p className="mt-1 text-sm text-ink-600">
            {line.vendor || 'Vendor pending'} •{' '}
            {new Date(line.lineDate ?? line.expenseDate ?? Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </p>
          {line.category?.name ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">{line.category.name}</p> : null}
        </div>
        <CurrencyDisplay amount={line.amount} currency={line.currency} className="font-display text-lg font-black text-ink-950" />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-900"
          onClick={() => onEdit(line)}
          type="button"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
          onClick={() => onDelete(line)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  )
}
