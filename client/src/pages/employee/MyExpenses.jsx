import {
  MessageSquareMore,
  Paperclip,
  Search,
  ScanLine,
  ChevronRight,
  Download,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { exportExpensesCsv } from '../../api/expense.api.js'
import { ExpenseCard } from '../../components/expense/ExpenseCard.jsx'
import { ExpenseSummaryHeader } from '../../components/expense/ExpenseSummaryHeader.jsx'
import { buttonVariants } from '../../components/ui/button.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useExpenseStore } from '../../stores/expenseStore.js'
import { cn } from '../../utils/cn.js'

const filters = ['All', 'Draft', 'Submitted', 'Approved', 'Paid', 'Rejected']

function resolveStatus(expense) {
  if (expense.status === 'REJECTED') {
    return { label: 'Rejected', className: 'bg-[#ffe1e6] text-[#c4495a]' }
  }

  if (expense.paymentStatus === 'PAID' || expense.status === 'DONE') {
    return { label: 'Done', className: 'bg-[#dff5f7] text-[#0b7f88]' }
  }

  if (expense.status === 'APPROVED') {
    return { label: 'Approved', className: 'bg-[#e7f5e7] text-[#367b45]' }
  }

  if (expense.status === 'SUBMITTED') {
    return { label: 'Submitted', className: 'bg-[#eef3f5] text-[#51606f]' }
  }

  return { label: 'To Report', className: 'bg-[#dff5f7] text-[#0b7f88]' }
}

export function MyExpenses() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const expenses = useExpenseStore((state) => state.expenses)
  const error = useExpenseStore((state) => state.error)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const loadExpenses = useExpenseStore((state) => state.loadExpenses)

  useEffect(() => {
    loadExpenses().catch(() => {})
  }, [loadExpenses])

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()

    return expenses.filter((expense) => {
      const matchesFilter =
        activeFilter === 'All'
          ? true
          : activeFilter === 'Rejected'
            ? expense.status === 'REJECTED'
            : activeFilter === 'Paid'
              ? expense.paymentStatus === 'PAID' || expense.status === 'DONE'
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
  }, [activeFilter, expenses, search])

  const totalVisible = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
    0,
  )

  const monthLabel = filteredExpenses[0]
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
        new Date(filteredExpenses[0].expenseDate ?? filteredExpenses[0].createdAt),
      )
    : new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportExpensesCsv()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'my-expenses.csv'
      anchor.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isDesktop) {
    return (
      <div className="space-y-5">
        <ExpenseSummaryHeader expenses={expenses} />

        <div className="flex gap-3">
          <Link
            className={buttonVariants({ className: 'flex-1', variant: 'default' })}
            to="/expenses/new"
          >
            New
          </Link>
          <Link
            className={buttonVariants({ className: 'flex-1', variant: 'secondary' })}
            to="/scan"
          >
            <ScanLine className="h-4 w-4" />
            Scan
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              className={cn(
                'rounded-full border border-line px-4 py-2 text-sm font-medium transition',
                activeFilter === filter
                  ? 'bg-brand-900 text-white'
                  : 'bg-white text-ink-600',
              )}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="space-y-4">
          {isLoading && !expenses.length ? (
            <div className="surface-card p-5 text-sm text-ink-600">
              Loading your expense stream...
            </div>
          ) : filteredExpenses.length ? (
            filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} to={`/expenses/${expense.id}`} />
            ))
          ) : (
            <div className="surface-card p-5 text-sm leading-6 text-ink-600">
              No expenses match the current filter yet.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="app-filters h-fit">
        <Link className="odoo-primary-button w-full justify-center" to="/expenses/new">
          Create Report
        </Link>
        <button
          className="odoo-action-button w-full justify-center"
          disabled={isExporting}
          onClick={handleExport}
          type="button"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>

        <div className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            Status
          </p>
          <div className="space-y-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm',
                  activeFilter === filter ? 'bg-white shadow-soft text-ink-950' : 'text-ink-700',
                )}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                <span
                  className={cn(
                    'inline-flex h-4 w-4 rounded-sm border border-line bg-white',
                    activeFilter === filter && 'border-brand-900 bg-brand-900',
                  )}
                />
                <span className="font-medium">{filter}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="space-y-4">
        <section className="odoo-panel">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link className="odoo-primary-button" to="/expenses/new">
                New
              </Link>
              <Link className="odoo-primary-button !bg-brand-800 !border-brand-800" to="/scan">
                Scan
              </Link>
              <button className="odoo-action-button" onClick={handleExport} type="button">
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <h2 className="ml-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-ink-950">
                My Expenses
              </h2>
            </div>

            <div className="flex min-w-[380px] items-center gap-2">
              <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-ink-700">
                <Search className="h-4 w-4 text-ink-500" />
                <span className="odoo-muted-pill bg-brand-50 text-brand-900">My Expenses</span>
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  value={search}
                />
              </div>
            </div>
          </div>
        </section>

        <ExpenseSummaryHeader expenses={expenses} />

        {error ? (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <button className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white text-brand-800" type="button">
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
            <h3 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-ink-950">{monthLabel}</h3>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-900">
              {filteredExpenses.length} reports
            </span>
          </div>

          <section className="odoo-panel overflow-hidden">
            <table className="odoo-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input type="checkbox" />
                  </th>
                  <th>Expense Date</th>
                  <th>Description</th>
                  <th>Employee</th>
                  <th>Paid By</th>
                  <th>Activities</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !expenses.length ? (
                  <tr>
                    <td className="py-6 text-center text-sm text-ink-500" colSpan={8}>
                      Loading expense rows...
                    </td>
                  </tr>
                ) : filteredExpenses.length ? (
                  filteredExpenses.map((expense) => {
                    const status = resolveStatus(expense)
                    const receiptCount = expense._count?.receipts ?? expense.receipts?.length ?? 0
                    const commentCount = expense._count?.comments ?? expense.comments?.length ?? 0

                    return (
                      <tr key={expense.id}>
                        <td>
                          <input type="checkbox" />
                        </td>
                        <td className="font-medium text-[#54a1ad]">
                          <Link to={`/expenses/${expense.id}`}>
                            {new Date(expense.expenseDate ?? expense.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )}
                          </Link>
                        </td>
                        <td>
                          <Link
                            className="font-medium text-[#54a1ad]"
                            to={`/expenses/${expense.id}`}
                          >
                            {expense.title}
                          </Link>
                        </td>
                        <td className="text-[#54a1ad]">
                          {expense.creator?.firstName} {expense.creator?.lastName}
                        </td>
                        <td className="text-[#54a1ad]">Employee (to reimburse)</td>
                        <td>
                          <div className="flex items-center gap-4 text-[#54a1ad]">
                            <span className="inline-flex items-center gap-1">
                              <MessageSquareMore className="h-4 w-4" />
                              {commentCount}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="h-4 w-4" />
                              {receiptCount}
                            </span>
                          </div>
                        </td>
                        <td className="text-right font-semibold text-[#2f7f91]">
                          ${Number(expense.convertedAmount ?? expense.totalAmount ?? 0).toFixed(2)}
                        </td>
                        <td>
                          <span className={cn('odoo-status-pill', status.className)}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="py-6 text-center text-sm text-ink-500" colSpan={8}>
                      No expenses match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-end border-t border-line bg-white px-4 py-4">
              <span className="text-lg font-semibold tracking-[-0.03em] text-ink-950">
                ${totalVisible.toFixed(2)}
              </span>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
