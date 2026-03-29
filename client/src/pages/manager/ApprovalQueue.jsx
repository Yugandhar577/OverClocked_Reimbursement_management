import { CheckSquare2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney, formatShortDate } from '../../api/transformers.js'
import { buttonVariants } from '../../components/ui/button.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useApprovalStore } from '../../stores/approvalStore.js'
import { cn } from '../../utils/cn.js'

function summarize(items) {
  const amount = items.reduce(
    (sum, item) => sum + Number(item.expense.convertedAmount ?? item.expense.totalAmount ?? 0),
    0,
  )
  const employees = new Set(
    items
      .map((item) => item.expense.creator?.id ?? item.expense.creator?.email)
      .filter(Boolean),
  ).size

  return {
    amount,
    employees,
    claims: items.length,
  }
}

export function ApprovalQueue() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [search, setSearch] = useState('')
  const pendingItems = useApprovalStore((state) => state.pendingItems)
  const error = useApprovalStore((state) => state.error)
  const isLoading = useApprovalStore((state) => state.isLoading)
  const loadPending = useApprovalStore((state) => state.loadPending)

  useEffect(() => {
    loadPending().catch(() => {})
  }, [loadPending])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return pendingItems
    }

    return pendingItems.filter((item) => {
      const label = [
        item.expense.creator?.firstName,
        item.expense.creator?.lastName,
        item.expense.title,
        item.expense.description,
        item.expense.category?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return label.includes(query)
    })
  }, [pendingItems, search])

  const metrics = useMemo(() => summarize(filtered), [filtered])

  if (!isDesktop) {
    return (
      <div className="space-y-5">
        <section className="surface-card p-4">
          <p className="section-eyebrow">Queue</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-ink-950">
            Pending approvals
          </h2>
          <input
            className="mt-4 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-950 outline-none"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee or expense title"
            value={search}
          />
        </section>

        {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-4">
          {isLoading && !pendingItems.length ? (
            <div className="surface-card p-5 text-sm text-ink-600">Loading your queue...</div>
          ) : filtered.length ? (
            filtered.map((item) => (
              <Link key={item.stepId} className="surface-card block p-4" to={`/approvals/${item.expense.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                      Step {item.sequence}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-950">{item.expense.title}</h3>
                    <p className="mt-2 text-sm text-ink-600">
                      {item.expense.creator?.firstName} {item.expense.creator?.lastName}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-ink-950">
                    {formatMoney(item.expense.convertedAmount ?? item.expense.totalAmount, item.expense.currency)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="surface-card p-5 text-sm leading-6 text-ink-600">
              No pending approvals match your current filter.
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
              Claims in queue: <span className="font-semibold text-ink-950">{metrics.claims}</span>
            </div>
            <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-600">
              Employees: <span className="font-semibold text-ink-950">{metrics.employees}</span>
            </div>
            <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-600">
              Awaiting sign-off:{' '}
              <span className="font-semibold text-ink-950">
                {formatMoney(metrics.amount, filtered[0]?.expense.currency ?? 'USD')}
              </span>
            </div>
          </div>

          <div className="ml-auto flex min-w-[420px] items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm text-ink-700">
              <Search className="h-4 w-4 text-ink-500" />
              <input
                className="min-w-0 flex-1 bg-transparent outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee or expense title"
                value={search}
              />
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="odoo-panel overflow-hidden">
        <table className="odoo-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Description</th>
              <th>Submitted</th>
              <th>Approval Step</th>
              <th className="text-right">Total</th>
              <th>Status</th>
              <th className="w-[140px] text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !pendingItems.length ? (
              <tr>
                <td className="py-6 text-center text-sm text-ink-500" colSpan={7}>
                  Loading approval rows...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.stepId}>
                  <td>
                    <div>
                      <p className="font-medium text-[#54a1ad]">
                        {item.expense.creator?.firstName} {item.expense.creator?.lastName}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">{item.expense.creator?.email ?? 'Expense submitter'}</p>
                    </div>
                  </td>
                  <td>
                    <Link
                      className="font-medium text-[#54a1ad]"
                      to={`/approvals/${item.expense.id}`}
                    >
                      {item.expense.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-sm text-ink-500">
                      {item.expense.description || item.expense.category?.name || 'Expense claim awaiting approval'}
                    </p>
                  </td>
                  <td>{formatShortDate(item.expense.submittedAt ?? item.expense.updatedAt ?? item.expense.createdAt)}</td>
                  <td>
                    <span className="odoo-status-pill bg-[#eef2f6] text-[#5c6470]">
                      Step {item.sequence}
                    </span>
                  </td>
                  <td className="text-right font-semibold text-ink-950">
                    {formatMoney(item.expense.convertedAmount ?? item.expense.totalAmount, item.expense.currency)}
                  </td>
                  <td>
                    <span className="odoo-status-pill bg-[#dff5f7] text-[#0b7f88]">To Approve</span>
                  </td>
                  <td className="text-right">
                    <Link
                      className={cn(buttonVariants({ size: 'sm', variant: 'default' }), '!h-8 !px-3')}
                      to={`/approvals/${item.expense.id}`}
                    >
                      <CheckSquare2 className="h-4 w-4" />
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-6 text-center text-sm text-ink-500" colSpan={7}>
                  No pending approvals match your current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
