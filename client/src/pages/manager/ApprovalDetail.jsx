import { CheckCircle2, ChevronLeft, SendHorizontal, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatMoney, formatShortDate } from '../../api/transformers.js'
import { ApprovalTimeline } from '../../components/expense/ApprovalTimeline.jsx'
import { CommentThread } from '../../components/expense/CommentThread.jsx'
import { ReceiptViewer } from '../../components/expense/ReceiptViewer.jsx'
import { StatusPipeline } from '../../components/expense/StatusPipeline.jsx'
import { Button, buttonVariants } from '../../components/ui/button.jsx'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useApprovalStore } from '../../stores/approvalStore.js'
import { useExpenseStore } from '../../stores/expenseStore.js'

export function ApprovalDetail() {
  const { id } = useParams()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [decisionComment, setDecisionComment] = useState('')
  const currentExpense = useExpenseStore((state) => state.currentExpense)
  const error = useExpenseStore((state) => state.error)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const isSaving = useExpenseStore((state) => state.isSaving)
  const loadExpense = useExpenseStore((state) => state.loadExpense)
  const addComment = useExpenseStore((state) => state.addComment)
  const approve = useApprovalStore((state) => state.approve)
  const reject = useApprovalStore((state) => state.reject)

  useEffect(() => {
    if (id) {
      loadExpense(id).catch(() => {})
    }
  }, [id, loadExpense])

  if (isLoading && !currentExpense) {
    return <div className="odoo-panel px-5 py-6 text-sm text-ink-600">Approval detail is loading...</div>
  }

  if (!currentExpense) {
    return <div className="odoo-panel px-5 py-6 text-sm text-ink-600">Approval detail is not available.</div>
  }

  const expenseAmount = formatMoney(
    currentExpense.convertedAmount ?? currentExpense.totalAmount,
    currentExpense.currency,
  )

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="!h-10 !rounded-md !px-4"
        disabled={isSaving}
        onClick={async () => {
          await approve(currentExpense.id, decisionComment)
          await loadExpense(currentExpense.id)
        }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </Button>
      <Button
        className="!h-10 !rounded-md !px-4"
        disabled={isSaving}
        onClick={async () => {
          await reject(currentExpense.id, decisionComment)
          await loadExpense(currentExpense.id)
        }}
        variant="danger"
      >
        <XCircle className="h-4 w-4" />
        Refuse
      </Button>
      <Link
        className={buttonVariants({ variant: 'outline', className: '!h-10 !rounded-md !px-4' })}
        to="/approvals"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {isDesktop ? (
        <section className="odoo-subbar">
          <div className="odoo-subbar-inner justify-between gap-4">
            {actionButtons}
            <div className="min-w-[420px] max-w-[520px] flex-1">
              <StatusPipeline expense={currentExpense} />
            </div>
          </div>
        </section>
      ) : (
        actionButtons
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(340px,0.95fr)]">
        <div className="space-y-4">
          <section className="odoo-panel overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <p className="odoo-field-label">Expense Review</p>
              <h2 className="mt-2 text-[2.5rem] font-light tracking-[-0.06em] text-ink-950">
                {currentExpense.title}
              </h2>
            </div>

            <div className="grid gap-8 px-6 py-5 lg:grid-cols-[1.08fr_1fr]">
              <div className="space-y-5">
                <div className="grid grid-cols-[98px_minmax(0,1fr)] gap-y-4">
                  <span className="odoo-field-label">Employee</span>
                  <div>
                    <p className="odoo-field-value">
                      {currentExpense.creator?.firstName} {currentExpense.creator?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      {currentExpense.creator?.email ?? 'Employee account'}
                    </p>
                  </div>

                  <span className="odoo-field-label">Category</span>
                  <p className="odoo-field-value">{currentExpense.category?.name ?? 'General expenses'}</p>

                  <span className="odoo-field-label">Total</span>
                  <p className="odoo-field-value">{expenseAmount}</p>

                  <span className="odoo-field-label">Paid By</span>
                  <p className="odoo-field-value">Employee (to reimburse)</p>
                </div>

                <div className="rounded-md border border-line bg-[#fcfdff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Decision note
                  </p>
                  <textarea
                    className="mt-3 min-h-[160px] w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                    onChange={(event) => setDecisionComment(event.target.value)}
                    placeholder="Add the rationale that should travel with this decision."
                    value={decisionComment}
                  />
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-ink-500">
                    <span>{decisionComment.length} characters</span>
                    <span className="inline-flex items-center gap-2">
                      <SendHorizontal className="h-4 w-4" />
                      Shared with the employee timeline
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-[118px_minmax(0,1fr)] gap-y-4">
                  <span className="odoo-field-label">Expense Date</span>
                  <p className="odoo-field-value">{formatShortDate(currentExpense.expenseDate)}</p>

                  <span className="odoo-field-label">Submitted</span>
                  <p className="odoo-field-value">
                    {formatShortDate(currentExpense.submittedAt ?? currentExpense.updatedAt ?? currentExpense.createdAt)}
                  </p>

                  <span className="odoo-field-label">Account</span>
                  <p className="odoo-field-value">
                    {currentExpense.category?.code ? `${currentExpense.category.code} Expenses` : '600000 Expenses'}
                  </p>
                </div>

                <div className="min-h-[192px] rounded-md border border-line bg-[#fcfdff] p-4 text-sm leading-7 text-ink-600">
                  {currentExpense.description || 'No additional employee notes were added to this expense.'}
                </div>
              </div>
            </div>
          </section>

          <ApprovalTimeline steps={currentExpense.approvalSteps ?? []} />

          <CommentThread
            comments={currentExpense.comments ?? []}
            isSaving={isSaving}
            onSubmit={(payload) => addComment(currentExpense.id, payload)}
          />
        </div>

        <ReceiptViewer receipts={currentExpense.receipts ?? []} />
      </div>
    </div>
  )
}
