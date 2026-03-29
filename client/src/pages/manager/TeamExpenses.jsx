import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney, formatShortDate, toUiExpenseStatus } from '../../api/transformers.js'
import { ExpenseCard } from '../../components/expense/ExpenseCard.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useApprovalStore } from '../../stores/approvalStore.js'
import { cn } from '../../utils/cn.js'

const teamFilters = ['All', 'Submitted', 'Approved', 'Rejected', 'Paid']

function statusTone(expense) {
  const label = toUiExpenseStatus(expense)

  switch (label) {
    case 'Paid':
      return { label, className: 'bg-[#dff5f7] text-[#0b7f88]' }
    case 'Approved':
      return { label, className: 'bg-[#e7f5e7] text-[#367b45]' }
    case 'Refused':
      return { label, className: 'bg-[#ffe1e6] text-[#c4495a]' }
    case 'Submitted':
      return { label, className: 'bg-[#eef2f6] text-[#58626f]' }
    default:
      return { label, className: 'bg-[#f3ebf1] text-brand-900' }
  }
}

export function TeamExpenses() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const teamExpenses = useApprovalStore((state) => state.teamExpenses)
  const error = useApprovalStore((state) => state.error)
  const isLoading = useApprovalStore((state) => state.isLoading)
  const loadTeamExpenses = useApprovalStore((state) => state.loadTeamExpenses)

  useEffect(() => {
    loadTeamExpenses().catch(() => {})
  }, [loadTeamExpenses])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return teamExpenses.filter((expense) => {
      const matchesFilter =
        activeFilter === 'All'
          ? true
          : activeFilter === 'Paid'
            ? expense.paymentStatus === 'PAID' || expense.status === 'DONE'
            : activeFilter === 'Rejected'
              ? expense.status === 'REJECTED'
              : expense.status === activeFilter.toUpperCase()

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        expense.title,
        expense.description,
        expense.creator?.firstName,
        expense.creator?.lastName,
        expense.category?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [activeFilter, search, teamExpenses])

  const totalAmount = filtered.reduce(
    (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
    0,
  )

  if (!isDesktop) {
    return (
      <div className="space-y-5">
        <section className="surface-card p-4">
          <p className="section-eyebrow">Team Lens</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-ink-950">
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
              className={cn(
                'rounded-full border border-line px-4 py-2 text-sm font-medium transition',
                activeFilter === filter ? 'bg-brand-900 text-white' : 'bg-white text-ink-600',
              )}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-4">
          {isLoading && !teamExpenses.length ? (
            <div className="surface-card p-5 text-sm text-ink-600">Loading team expenses...</div>
          ) : filtered.length ? (
            filtered.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} to={`/approvals/${expense.id}`} />
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

  return (
    <div className="space-y-4">
      <section className="odoo-subbar">
        <div className="odoo-subbar-inner">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-600">
              Visible claims: <span className="font-semibold text-ink-950">{filtered.length}</span>
            </div>
            <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-600">
              Team spend:{' '}
              <span className="font-semibold text-ink-950">
                {formatMoney(totalAmount, filtered[0]?.currency ?? 'USD')}
              </span>
            </div>
          </div>

          <div className="ml-auto flex min-w-[420px] items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-ink-700">
              <Search className="h-4 w-4 text-ink-500" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, employee, or category"
                value={search}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {teamFilters.map((filter) => (
          <button
            key={filter}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition',
              activeFilter === filter
                ? 'border-brand-900 bg-brand-900 text-white'
                : 'border-line bg-white text-ink-600',
            )}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="odoo-panel overflow-hidden">
        <table className="odoo-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Description</th>
              <th>Category</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !teamExpenses.length ? (
              <tr>
                <td className="py-6 text-center text-sm text-ink-500" colSpan={6}>
                  Loading team expense rows...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((expense) => {
                const tone = statusTone(expense)

                return (
                  <tr key={expense.id}>
                    <td>{formatShortDate(expense.expenseDate ?? expense.createdAt)}</td>
                    <td>
                      <div>
                        <p className="font-medium text-[#54a1ad]">
                          {expense.creator?.firstName} {expense.creator?.lastName}
                        </p>
                        <p className="mt-1 text-sm text-ink-500">{expense.creator?.email ?? 'Team member'}</p>
                      </div>
                    </td>
                    <td>
                      <Link
                        className="font-medium text-[#54a1ad]"
                        to={`/approvals/${expense.id}`}
                      >
                        {expense.title}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-sm text-ink-500">
                        {expense.description || 'Submitted expense'}
                      </p>
                    </td>
                    <td>{expense.category?.name ?? 'General expenses'}</td>
                    <td className="text-right font-semibold text-ink-950">
                      {formatMoney(expense.convertedAmount ?? expense.totalAmount, expense.currency)}
                    </td>
                    <td>
                      <span className={cn('odoo-status-pill', tone.className)}>{tone.label}</span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="py-6 text-center text-sm text-ink-500" colSpan={6}>
                  No team expenses match this status yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
