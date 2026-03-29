import { PencilLine, Send } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApprovalTimeline } from '../../components/expense/ApprovalTimeline.jsx'
import { CommentThread } from '../../components/expense/CommentThread.jsx'
import { ReceiptViewer } from '../../components/expense/ReceiptViewer.jsx'
import { StatusPipeline } from '../../components/expense/StatusPipeline.jsx'
import { Button } from '../../components/ui/button.jsx'
import { buttonVariants } from '../../components/ui/button.jsx'
import { useExpenseStore } from '../../stores/expenseStore.js'
import { formatMoney } from '../../api/transformers.js'

export function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentExpense = useExpenseStore((state) => state.currentExpense)
  const error = useExpenseStore((state) => state.error)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const isSaving = useExpenseStore((state) => state.isSaving)
  const loadExpense = useExpenseStore((state) => state.loadExpense)
  const addComment = useExpenseStore((state) => state.addComment)
  const submitExpense = useExpenseStore((state) => state.submitExpense)

  useEffect(() => {
    if (id) {
      loadExpense(id).catch(() => {})
    }
  }, [id, loadExpense])

  if (isLoading && !currentExpense) {
    return <div className="surface-card p-5 text-sm text-ink-600">Loading expense detail...</div>
  }

  if (!currentExpense) {
    return <div className="surface-card p-5 text-sm text-ink-600">Expense detail is not available.</div>
  }

  return (
    <div className="space-y-5">
      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <StatusPipeline expense={currentExpense} />

      <section className="surface-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Expense</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
              {currentExpense.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {currentExpense.description || 'No description was added to this claim yet.'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-black tracking-[-0.04em] text-ink-950">
              {formatMoney(currentExpense.convertedAmount ?? currentExpense.totalAmount, currentExpense.currency)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-500">
              {new Date(currentExpense.expenseDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] bg-brand-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Category</p>
            <p className="mt-1 text-sm font-semibold text-ink-950">
              {currentExpense.category?.name ?? 'Uncategorized'}
            </p>
          </div>
          <div className="rounded-[22px] bg-aqua-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aqua-700">Employee</p>
            <p className="mt-1 text-sm font-semibold text-ink-950">
              {currentExpense.creator?.firstName} {currentExpense.creator?.lastName}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {(currentExpense.status === 'DRAFT' || currentExpense.status === 'TO_SUBMIT') ? (
            <>
              <Link
                className={buttonVariants({ className: 'flex-1', variant: 'secondary' })}
                to="/expenses/new"
                state={{ expenseId: currentExpense.id }}
              >
                <PencilLine className="h-4 w-4" />
                Edit draft
              </Link>
              <Button
                className="flex-1"
                disabled={isSaving}
                onClick={async () => {
                  await submitExpense(currentExpense.id)
                  navigate(`/expenses/${currentExpense.id}`, { replace: true })
                }}
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </>
          ) : null}
        </div>
      </section>

      <ReceiptViewer receipts={currentExpense.receipts ?? []} />
      <ApprovalTimeline steps={currentExpense.approvalSteps ?? []} />
      <CommentThread
        comments={currentExpense.comments ?? []}
        isSaving={isSaving}
        onSubmit={(payload) => addComment(currentExpense.id, payload)}
      />
    </div>
  )
}
