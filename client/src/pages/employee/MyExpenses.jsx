import { Plus, ScanLine } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExpenseCard } from '../../components/expense/ExpenseCard.jsx'
import { ExpenseSummaryHeader } from '../../components/expense/ExpenseSummaryHeader.jsx'
import { buttonVariants } from '../../components/ui/button.jsx'
import { useExpenseStore } from '../../stores/expenseStore.js'

const filters = ['All', 'Draft', 'Submitted', 'Approved', 'Paid', 'Rejected']

export function MyExpenses() {
  const [activeFilter, setActiveFilter] = useState('All')
  const expenses = useExpenseStore((state) => state.expenses)
  const error = useExpenseStore((state) => state.error)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const loadExpenses = useExpenseStore((state) => state.loadExpenses)

  useEffect(() => {
    loadExpenses().catch(() => {})
  }, [loadExpenses])

  const filteredExpenses = useMemo(() => {
    if (activeFilter === 'All') {
      return expenses
    }

    if (activeFilter === 'Rejected') {
      return expenses.filter((expense) => expense.status === 'REJECTED')
    }

    return expenses.filter((expense) => {
      if (activeFilter === 'Paid') {
        return expense.paymentStatus === 'PAID' || expense.status === 'DONE'
      }

      return expense.status === activeFilter.toUpperCase()
    })
  }, [activeFilter, expenses])

  return (
    <div className="space-y-5">
      <ExpenseSummaryHeader expenses={expenses} />

      <div className="flex gap-3">
        <Link className={buttonVariants({ className: 'flex-1', variant: 'default' })} to="/expenses/new">
          <Plus className="h-4 w-4" />
          New expense
        </Link>
        <Link className={buttonVariants({ className: 'flex-1', variant: 'secondary' })} to="/scan">
          <ScanLine className="h-4 w-4" />
          Scan receipt
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeFilter === filter
                ? 'bg-brand-900 text-white shadow-soft'
                : 'bg-white text-ink-600 shadow-soft'
            }`}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="space-y-4">
        {isLoading && !expenses.length ? (
          <div className="surface-card p-5 text-sm text-ink-600">Loading your expense stream...</div>
        ) : filteredExpenses.length ? (
          filteredExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} to={`/expenses/${expense.id}`} />
          ))
        ) : (
          <div className="surface-card p-5 text-sm leading-6 text-ink-600">
            No expenses match the current filter yet. Start a new draft or capture a receipt to kick off the flow.
          </div>
        )}
      </div>
    </div>
  )
}
