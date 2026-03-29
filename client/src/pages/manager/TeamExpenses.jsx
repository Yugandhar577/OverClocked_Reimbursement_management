import { useEffect, useMemo, useState } from 'react'
import { ExpenseCard } from '../../components/expense/ExpenseCard.jsx'
import { useApprovalStore } from '../../stores/approvalStore.js'

const teamFilters = ['All', 'Submitted', 'Approved', 'Rejected', 'Paid']

export function TeamExpenses() {
  const [activeFilter, setActiveFilter] = useState('All')
  const teamExpenses = useApprovalStore((state) => state.teamExpenses)
  const error = useApprovalStore((state) => state.error)
  const isLoading = useApprovalStore((state) => state.isLoading)
  const loadTeamExpenses = useApprovalStore((state) => state.loadTeamExpenses)

  useEffect(() => {
    loadTeamExpenses().catch(() => {})
  }, [loadTeamExpenses])

  const filtered = useMemo(() => {
    if (activeFilter === 'All') {
      return teamExpenses
    }

    if (activeFilter === 'Paid') {
      return teamExpenses.filter((expense) => expense.paymentStatus === 'PAID' || expense.status === 'DONE')
    }

    if (activeFilter === 'Rejected') {
      return teamExpenses.filter((expense) => expense.status === 'REJECTED')
    }

    return teamExpenses.filter((expense) => expense.status === activeFilter.toUpperCase())
  }, [activeFilter, teamExpenses])

  return (
    <div className="space-y-5">
      <section className="surface-card p-4">
        <p className="section-eyebrow">Team Lens</p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
          Team expenses
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-600">
          Review the broader team feed while staying ready for the next approval request.
        </p>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {teamFilters.map((filter) => (
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
        {isLoading && !teamExpenses.length ? (
          <div className="surface-card p-5 text-sm text-ink-600">Loading team expenses...</div>
        ) : filtered.length ? (
          filtered.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} to={`/expenses/${expense.id}`} />
          ))
        ) : (
          <div className="surface-card p-5 text-sm leading-6 text-ink-600">
            No team expenses match this status yet.
          </div>
        )}
      </div>
    </div>
  )
}
