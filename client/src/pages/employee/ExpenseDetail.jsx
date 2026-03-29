import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApprovalTimeline } from '../../components/expense/ApprovalTimeline.jsx'
import { CommentThread } from '../../components/expense/CommentThread.jsx'
import { ReceiptViewer } from '../../components/expense/ReceiptViewer.jsx'
import { SplitExpenseModal } from '../../components/expense/SplitExpenseModal.jsx'
import { StatusPipeline } from '../../components/expense/StatusPipeline.jsx'
import { Button, buttonVariants } from '../../components/ui/button.jsx'
import { useExpenseStore } from '../../stores/expenseStore.js'
import { formatMoney } from '../../api/transformers.js'

function currencyAmount(expense) {
  return formatMoney(
    expense.convertedAmount ?? expense.totalAmount,
    expense.currency,
  )
}

export function ExpenseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const receiptInputRef = useRef(null)
  const [splitOpen, setSplitOpen] = useState(false)
  const currentExpense = useExpenseStore((state) => state.currentExpense)
  const error = useExpenseStore((state) => state.error)
  const isLoading = useExpenseStore((state) => state.isLoading)
  const isSaving = useExpenseStore((state) => state.isSaving)
  const loadExpense = useExpenseStore((state) => state.loadExpense)
  const addComment = useExpenseStore((state) => state.addComment)
  const submitExpense = useExpenseStore((state) => state.submitExpense)
  const uploadAndProcessReceipt = useExpenseStore((state) => state.uploadAndProcessReceipt)
  const saveLine = useExpenseStore((state) => state.saveLine)
  const removeLine = useExpenseStore((state) => state.removeLine)

  useEffect(() => {
    if (id) {
      loadExpense(id).catch(() => {})
    }
  }, [id, loadExpense])

  const splitTarget = useMemo(() => {
    if (!currentExpense) {
      return null
    }

    return (
      currentExpense.expenseLines?.[0] ?? {
        id: null,
        description: currentExpense.title,
        amount: Number(currentExpense.totalAmount ?? 0),
        currency: currentExpense.currency,
        vendor: currentExpense.expenseLines?.[0]?.vendor ?? null,
        lineDate: currentExpense.expenseDate,
        categoryId: currentExpense.categoryId ?? null,
        category: currentExpense.category ?? null,
      }
    )
  }, [currentExpense])

  if (isLoading && !currentExpense) {
    return (
      <div className="odoo-panel px-5 py-6 text-sm text-ink-600">
        Loading expense detail...
      </div>
    )
  }

  if (!currentExpense) {
    return (
      <div className="odoo-panel px-5 py-6 text-sm text-ink-600">
        Expense detail is not available.
      </div>
    )
  }

  const canSubmit =
    currentExpense.status === 'DRAFT' || currentExpense.status === 'TO_SUBMIT'

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="odoo-subbar">
        <div className="odoo-subbar-inner justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="!h-10 !rounded-md !px-4"
              disabled={!canSubmit || isSaving}
              onClick={async () => {
                await submitExpense(currentExpense.id)
                navigate(`/expenses/${currentExpense.id}`, { replace: true })
              }}
            >
              Create Report
            </Button>
            <button
              className="odoo-action-button"
              onClick={() => receiptInputRef.current?.click()}
              type="button"
            >
              Attach Receipt
            </button>
            <button
              className="odoo-action-button"
              onClick={() => setSplitOpen(true)}
              type="button"
            >
              Split Expense
            </button>
            <Link className={buttonVariants({ variant: 'outline', className: '!h-10 !rounded-md !px-4' })} to="/expenses">
              Back to list
            </Link>
            <input
              ref={receiptInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }

                await uploadAndProcessReceipt(currentExpense.id, file)
                await loadExpense(currentExpense.id)
                event.target.value = ''
              }}
              type="file"
            />
          </div>

          <div className="min-w-[420px] max-w-[520px] flex-1">
            <StatusPipeline expense={currentExpense} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(340px,0.95fr)]">
        <div className="space-y-4">
          <section className="odoo-panel overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <p className="odoo-field-label">Description</p>
              <h2 className="mt-2 text-[3rem] font-light tracking-[-0.06em] text-ink-950">
                {currentExpense.title}
              </h2>
            </div>

            <div className="grid gap-8 px-6 py-5 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-5">
                <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 text-sm">
                  <span className="odoo-field-label">Category</span>
                  <div>
                    <p className="odoo-field-value">
                      {currentExpense.category?.code
                        ? `[${currentExpense.category.code}] ${currentExpense.category.name}`
                        : currentExpense.category?.name ?? 'General expenses'}
                    </p>
                    <p className="mt-1 text-sm italic text-ink-500">
                      {currentExpense.category?.description || 'General expenses'}
                    </p>
                  </div>

                  <span className="odoo-field-label">Total</span>
                  <p className="odoo-field-value">{currencyAmount(currentExpense)}</p>

                  <span className="odoo-field-label">Included taxes</span>
                  <p className="odoo-field-value">$ 0.00</p>

                  <span className="odoo-field-label">Employee</span>
                  <p className="odoo-field-value">
                    {currentExpense.creator?.firstName} {currentExpense.creator?.lastName}
                  </p>

                  <span className="odoo-field-label">Paid By</span>
                  <div className="space-y-2 text-sm text-ink-800">
                    <label className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#0b9aa8]">
                        <span className="h-2 w-2 rounded-full bg-[#0b9aa8]" />
                      </span>
                      Employee (to reimburse)
                    </label>
                    <label className="flex items-center gap-2 text-ink-500">
                      <span className="inline-flex h-4 w-4 rounded-full border border-line" />
                      Company
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-y-4">
                  <span className="odoo-field-label">Expense Date</span>
                  <p className="odoo-field-value">
                    {new Date(currentExpense.expenseDate).toLocaleDateString('en-US')}
                  </p>

                  <span className="odoo-field-label">Account</span>
                  <p className="odoo-field-value">
                    {currentExpense.category?.code ? `${currentExpense.category.code} Expenses` : '600000 Expenses'}
                  </p>
                </div>

                <div className="mt-6 min-h-[180px] rounded-md border border-line bg-[#fcfdff] p-4 text-sm leading-7 text-ink-600">
                  {currentExpense.description || 'Notes...'}
                </div>
              </div>
            </div>
          </section>

          <CommentThread
            comments={currentExpense.comments ?? []}
            isSaving={isSaving}
            onSubmit={(payload) => addComment(currentExpense.id, payload)}
          />

          <ApprovalTimeline steps={currentExpense.approvalSteps ?? []} />
        </div>

        <ReceiptViewer receipts={currentExpense.receipts ?? []} />
      </div>

      <SplitExpenseModal
        isOpen={splitOpen}
        line={splitTarget}
        onClose={() => setSplitOpen(false)}
        onSplit={async (splitLines) => {
          if (!splitTarget) {
            return
          }

          if (splitTarget.id) {
            await removeLine(currentExpense.id, splitTarget.id)
          }

          for (const splitLine of splitLines) {
            await saveLine(currentExpense.id, null, {
              description: splitLine.description,
              amount: Number(splitLine.amount),
              currency: splitLine.currency ?? currentExpense.currency,
              vendor: splitLine.vendor ?? null,
              lineDate: new Date(splitLine.lineDate ?? currentExpense.expenseDate).toISOString(),
              categoryId: splitLine.categoryId ?? currentExpense.categoryId ?? null,
            })
          }

          await loadExpense(currentExpense.id)
          setSplitOpen(false)
        }}
      />
    </div>
  )
}
