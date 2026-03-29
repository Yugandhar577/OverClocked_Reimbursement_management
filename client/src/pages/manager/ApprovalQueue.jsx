import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button.jsx'
import { CurrencyDisplay } from '../../components/expense/CurrencyDisplay.jsx'
import { useApprovalStore } from '../../stores/approvalStore.js'

export function ApprovalQueue() {
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
      const label = `${item.expense.creator?.firstName ?? ''} ${item.expense.creator?.lastName ?? ''} ${item.expense.title ?? ''}`.toLowerCase()
      return label.includes(query)
    })
  }, [pendingItems, search])

  return (
    <div className="space-y-5">
      <section className="surface-card p-4">
        <p className="section-eyebrow">Queue</p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
          Pending approvals
        </h2>
        <input
          className="mt-4 h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink-950 shadow-soft outline-none"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employee or expense title"
          value={search}
        />
      </section>

      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="space-y-4">
        {isLoading && !pendingItems.length ? (
          <div className="surface-card p-5 text-sm text-ink-600">Loading your queue...</div>
        ) : filtered.length ? (
          filtered.map((item) => (
            <Link key={item.stepId} className="surface-card block p-4" to={`/approvals/${item.expense.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                    Step {item.sequence}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-ink-950">
                    {item.expense.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-600">
                    {item.expense.creator?.firstName} {item.expense.creator?.lastName}
                  </p>
                </div>
                <CurrencyDisplay
                  amount={item.expense.convertedAmount ?? item.expense.totalAmount}
                  currency={item.expense.currency}
                  className="font-display text-lg font-black text-ink-950"
                />
              </div>

              <div className="mt-4">
                <Button size="sm">Review claim</Button>
              </div>
            </Link>
          ))
        ) : (
          <div className="surface-card p-5 text-sm leading-6 text-ink-600">
            No pending approvals match your current filter. The queue will refill automatically as employees submit claims.
          </div>
        )}
      </div>
    </div>
  )
}
