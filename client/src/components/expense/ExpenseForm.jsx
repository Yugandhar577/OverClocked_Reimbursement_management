import { Plus, Scissors } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { ExpenseLineItem } from './ExpenseLineItem.jsx'
import { FileUpload } from './FileUpload.jsx'
import { SplitExpenseModal } from './SplitExpenseModal.jsx'

const emptyLine = {
  description: '',
  amount: '',
  currency: 'USD',
  vendor: '',
  lineDate: new Date().toISOString().slice(0, 10),
  categoryId: '',
}

const selectClassName =
  'h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink-950 shadow-soft transition-all focus:border-brand-600/40 focus:outline-none focus:ring-2 focus:ring-brand-600/15'

export function ExpenseForm({
  categories,
  currencies,
  file,
  isSaving,
  mode = 'edit',
  onChange,
  onCreateDraft,
  onDeleteLine,
  onSave,
  onSaveLine,
  onSubmit,
  onUploadReceipt,
  values,
}) {
  const [lineDraft, setLineDraft] = useState(emptyLine)
  const [editingLineId, setEditingLineId] = useState('')
  const [splitTarget, setSplitTarget] = useState(null)

  const availableCurrencies = useMemo(
    () =>
      currencies.length
        ? currencies.map((item) => item.code ?? item.value ?? item)
        : ['USD', 'EUR', 'GBP', 'INR'],
    [currencies],
  )

  const handleLineSubmit = async () => {
    let expenseId = values.id

    if (!values.id && onCreateDraft) {
      expenseId = await onCreateDraft()
    }

    if (!expenseId) {
      return
    }

    await onSaveLine(expenseId, editingLineId || null, {
      ...lineDraft,
      amount: Number(lineDraft.amount),
      lineDate: new Date(lineDraft.lineDate).toISOString(),
      categoryId: lineDraft.categoryId || null,
      vendor: lineDraft.vendor || null,
    })

    setLineDraft({
      ...emptyLine,
      currency: values.currency || emptyLine.currency,
      lineDate: values.expenseDate || emptyLine.lineDate,
    })
    setEditingLineId('')
  }

  const startEditLine = (line) => {
    setEditingLineId(line.id)
    setLineDraft({
      description: line.description ?? '',
      amount: String(line.amount ?? ''),
      currency: line.currency ?? values.currency ?? 'USD',
      vendor: line.vendor ?? '',
      lineDate: new Date(line.lineDate ?? values.expenseDate ?? Date.now()).toISOString().slice(0, 10),
      categoryId: line.categoryId ?? '',
    })
  }

  return (
    <div className="space-y-5">
      <section className="surface-card p-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Title</label>
            <Input onChange={(event) => onChange('title', event.target.value)} placeholder="Client dinner in Bengaluru" value={values.title} />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Description</label>
            <textarea
              className="min-h-28 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm text-ink-950 shadow-soft outline-none transition focus:border-brand-500"
              onChange={(event) => onChange('description', event.target.value)}
              placeholder="Add context that helps approvers understand the spend."
              value={values.description}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Amount</label>
              <Input onChange={(event) => onChange('totalAmount', event.target.value)} type="number" value={values.totalAmount} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Currency</label>
              <select className={selectClassName} onChange={(event) => onChange('currency', event.target.value)} value={values.currency}>
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Category</label>
              <select className={selectClassName} onChange={(event) => onChange('categoryId', event.target.value)} value={values.categoryId}>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Expense date</label>
              <Input onChange={(event) => onChange('expenseDate', event.target.value)} type="date" value={values.expenseDate} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Vendor</label>
              <Input onChange={(event) => onChange('vendor', event.target.value)} placeholder="Vendor or merchant" value={values.vendor} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Quick actions</label>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={onSave} size="sm" variant="secondary">
                  Save draft
                </Button>
                <Link className={buttonVariants({ className: 'flex-1', size: 'sm', variant: 'outline' })} to="/scan">
                  Scan receipt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FileUpload
        file={file}
        helperText={values.id ? 'Upload now to attach the receipt to this draft.' : 'Save the draft first, or scan from the dedicated capture flow.'}
        onFileSelect={(selectedFile) => {
          if (values.id) {
            onUploadReceipt(selectedFile)
          } else {
            onChange('localFile', selectedFile)
          }
        }}
      />

      <section className="surface-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Line Items</p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-ink-950">Split-friendly details</h3>
          </div>
          <Button onClick={handleLineSubmit} size="sm">
            <Plus className="h-4 w-4" />
            {editingLineId ? 'Update line' : 'Add line'}
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          <Input onChange={(event) => setLineDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Line description" value={lineDraft.description} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input onChange={(event) => setLineDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" type="number" value={lineDraft.amount} />
            <Input onChange={(event) => setLineDraft((current) => ({ ...current, vendor: event.target.value }))} placeholder="Vendor" value={lineDraft.vendor} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select className={selectClassName} onChange={(event) => setLineDraft((current) => ({ ...current, currency: event.target.value }))} value={lineDraft.currency}>
              {availableCurrencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <select className={selectClassName} onChange={(event) => setLineDraft((current) => ({ ...current, categoryId: event.target.value }))} value={lineDraft.categoryId}>
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Input onChange={(event) => setLineDraft((current) => ({ ...current, lineDate: event.target.value }))} type="date" value={lineDraft.lineDate} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {(values.expenseLines ?? []).length ? (
            values.expenseLines.map((line) => (
              <div key={line.id} className="space-y-2">
                <ExpenseLineItem
                  line={line}
                  onDelete={() => onDeleteLine(line)}
                  onEdit={startEditLine}
                />
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                  onClick={() => setSplitTarget(line)}
                  type="button"
                >
                  <Scissors className="h-4 w-4" />
                  Split line
                </button>
              </div>
            ))
          ) : (
            <p className="rounded-[22px] bg-brand-50 px-4 py-4 text-sm leading-6 text-ink-700">
              Add at least one line to make the claim easier to review and split later.
            </p>
          )}
        </div>
      </section>

      <div className="flex gap-3">
        <Button className="flex-1" disabled={isSaving} onClick={onSave} variant="secondary">
          Save draft
        </Button>
        <Button className="flex-1" disabled={isSaving || mode === 'readonly'} onClick={onSubmit}>
          Submit expense
        </Button>
      </div>

      <SplitExpenseModal
        isOpen={Boolean(splitTarget)}
        line={splitTarget}
        onClose={() => setSplitTarget(null)}
        onSplit={async (splitLines) => {
          if (!values.id || !splitTarget?.id) {
            return
          }

          await onDeleteLine(splitTarget)

          for (const splitLine of splitLines) {
            await onSaveLine(values.id, null, {
              description: splitLine.description,
              amount: Number(splitLine.amount),
              currency: splitLine.currency ?? values.currency,
              vendor: splitLine.vendor ?? null,
              lineDate: new Date(splitLine.lineDate ?? values.expenseDate).toISOString(),
              categoryId: splitLine.categoryId ?? null,
            })
          }

          setSplitTarget(null)
        }}
      />
    </div>
  )
}
