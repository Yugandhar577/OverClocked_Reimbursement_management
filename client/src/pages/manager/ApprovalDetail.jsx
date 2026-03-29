import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ApprovalTimeline } from '../../components/expense/ApprovalTimeline.jsx'
import { CommentThread } from '../../components/expense/CommentThread.jsx'
import { ReceiptViewer } from '../../components/expense/ReceiptViewer.jsx'
import { StatusPipeline } from '../../components/expense/StatusPipeline.jsx'
import { Button } from '../../components/ui/button.jsx'
import { useApprovalStore } from '../../stores/approvalStore.js'
import { useExpenseStore } from '../../stores/expenseStore.js'
import { formatMoney } from '../../api/transformers.js'

export function ApprovalDetail() {
  const { id } = useParams()
  const [decisionComment, setDecisionComment] = useState('')
  const currentExpense = useExpenseStore((state) => state.currentExpense)
  const error = useExpenseStore((state) => state.error)
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

  if (!currentExpense) {
    return <div className="surface-card p-5 text-sm text-ink-600">Approval detail is loading...</div>
  }

  return (
    <div className="space-y-5">
      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <StatusPipeline expense={currentExpense} />

      <section className="surface-card p-4">
        <p className="section-eyebrow">Action view</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
              {currentExpense.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Submitted by {currentExpense.creator?.firstName} {currentExpense.creator?.lastName}
            </p>
          </div>
          <p className="font-display text-2xl font-black tracking-[-0.04em] text-ink-950">
            {formatMoney(currentExpense.convertedAmount ?? currentExpense.totalAmount, currentExpense.currency)}
          </p>
        </div>

        <textarea
          className="mt-4 min-h-24 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm text-ink-950 shadow-soft outline-none"
          onChange={(event) => setDecisionComment(event.target.value)}
          placeholder="Add the rationale that should travel with this decision."
          value={decisionComment}
        />

        <div className="mt-4 flex gap-3">
          <Button
            className="flex-1"
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
            className="flex-1"
            disabled={isSaving}
            onClick={async () => {
              await reject(currentExpense.id, decisionComment)
              await loadExpense(currentExpense.id)
            }}
            variant="danger"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
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
