import { Paperclip, Plus, ScanLine, Scissors, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
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
  'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100'

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
  const uploadRef = useRef(null)
  const [lineDraft, setLineDraft] = useState(emptyLine)
  const [editingLineId, setEditingLineId] = useState('')
  const [splitTarget, setSplitTarget] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }

    const nextUrl = URL.createObjectURL(file)
    setPreviewUrl(nextUrl)

    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [file])

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

  const lineTotal = (values.expenseLines ?? []).reduce(
    (sum, line) => sum + Number(line.amount ?? 0),
    0,
  )

  const startEditLine = (line) => {
    setEditingLineId(line.id)
    setLineDraft({
      description: line.description ?? '',
      amount: String(line.amount ?? ''),
      currency: line.currency ?? values.currency ?? 'USD',
      vendor: line.vendor ?? '',
      lineDate: new Date(line.lineDate ?? values.expenseDate ?? Date.now())
        .toISOString()
        .slice(0, 10),
      categoryId: line.categoryId ?? '',
    })
  }

  return (
    <div className="space-y-4">
      <section className="odoo-subbar">
        <div className="odoo-subbar-inner justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="!h-10 !rounded-md !px-4"
              disabled={isSaving}
              onClick={onSave}
            >
              Save Draft
            </Button>
            <button
              className="odoo-action-button"
              onClick={() => uploadRef.current?.click()}
              type="button"
            >
              <Paperclip className="h-4 w-4" />
              Attach Receipt
            </button>
            <Link className="odoo-action-button" to="/scan">
              <ScanLine className="h-4 w-4" />
              Scan Receipt
            </Link>
            <Button
              className="!h-10 !rounded-md !px-4"
              disabled={isSaving || mode === 'readonly'}
              onClick={onSubmit}
              variant="secondary"
            >
              Submit Expense
            </Button>
          </div>

          <div className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-600">
            Draft total: <span className="font-semibold text-ink-950">${Number(values.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.92fr)]">
        <div className="space-y-4">
          <section className="odoo-panel overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <p className="odoo-field-label">Description</p>
              <Input
                className="mt-2 !h-auto !border-0 !bg-transparent !px-0 !text-[2.75rem] !font-light !tracking-[-0.06em] !text-ink-950 !shadow-none focus:!ring-0"
                onChange={(event) => onChange('title', event.target.value)}
                placeholder="Carl's Camp Cooking Supplies"
                value={values.title}
              />
            </div>

            <div className="grid gap-8 px-6 py-5 lg:grid-cols-[1.1fr_1fr]">
              <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-y-4">
                <span className="odoo-field-label">Category</span>
                <div className="space-y-2">
                  <select
                    className={selectClassName}
                    onChange={(event) => onChange('categoryId', event.target.value)}
                    value={values.categoryId}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="odoo-field-label">Total</span>
                <Input
                  className="!h-10 !rounded-md !border-line !shadow-none"
                  onChange={(event) => onChange('totalAmount', event.target.value)}
                  type="number"
                  value={values.totalAmount}
                />

                <span className="odoo-field-label">Currency</span>
                <select
                  className={selectClassName}
                  onChange={(event) => onChange('currency', event.target.value)}
                  value={values.currency}
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>

                <span className="odoo-field-label">Vendor</span>
                <Input
                  className="!h-10 !rounded-md !border-line !shadow-none"
                  onChange={(event) => onChange('vendor', event.target.value)}
                  placeholder="Vendor or merchant"
                  value={values.vendor}
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-y-4">
                  <span className="odoo-field-label">Expense Date</span>
                  <Input
                    className="!h-10 !rounded-md !border-line !shadow-none"
                    onChange={(event) => onChange('expenseDate', event.target.value)}
                    type="date"
                    value={values.expenseDate}
                  />

                  <span className="odoo-field-label">Account</span>
                  <div className="odoo-field-value flex items-center">600000 Expenses</div>
                </div>

                <textarea
                  className="min-h-[188px] w-full rounded-md border border-line bg-[#fcfdff] px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  onChange={(event) => onChange('description', event.target.value)}
                  placeholder="Notes..."
                  value={values.description}
                />
              </div>
            </div>
          </section>

          <section className="odoo-panel overflow-hidden">
            <div className="border-b border-line px-6 py-4">
              <div className="flex items-center gap-4 text-sm font-medium">
                <button className="border-b-2 border-brand-700 pb-2 text-ink-950" type="button">
                  Order Lines
                </button>
                <button className="pb-2 text-ink-500" type="button">
                  Other Info
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="odoo-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Vendor</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Taxes</th>
                    <th className="text-right">Tax excl.</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {(values.expenseLines ?? []).length ? (
                    values.expenseLines.map((line) => (
                      <tr key={line.id}>
                        <td>
                          <button
                            className="font-medium text-[#54a1ad]"
                            onClick={() => startEditLine(line)}
                            type="button"
                          >
                            {line.description}
                          </button>
                        </td>
                        <td>{line.vendor || 'Vendor pending'}</td>
                        <td>1.00</td>
                        <td>${Number(line.amount ?? 0).toFixed(2)}</td>
                        <td>-</td>
                        <td className="text-right font-semibold">
                          ${Number(line.amount ?? 0).toFixed(2)}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-ink-500"
                              onClick={() => setSplitTarget(line)}
                              type="button"
                            >
                              <Scissors className="h-4 w-4" />
                            </button>
                            <button
                              className="text-ink-500"
                              onClick={() => onDeleteLine(line)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-sm text-ink-500" colSpan={7}>
                        No expense lines yet. Use the inline row below to add the first one.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-[#fcfdff]">
                    <td>
                      <Input
                        className="!h-10 !rounded-md !border-line !shadow-none"
                        onChange={(event) =>
                          setLineDraft((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Add a product or expense line"
                        value={lineDraft.description}
                      />
                    </td>
                    <td>
                      <Input
                        className="!h-10 !rounded-md !border-line !shadow-none"
                        onChange={(event) =>
                          setLineDraft((current) => ({
                            ...current,
                            vendor: event.target.value,
                          }))
                        }
                        placeholder="Vendor"
                        value={lineDraft.vendor}
                      />
                    </td>
                    <td>1.00</td>
                    <td>
                      <Input
                        className="!h-10 !rounded-md !border-line !shadow-none"
                        onChange={(event) =>
                          setLineDraft((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                        placeholder="0.00"
                        type="number"
                        value={lineDraft.amount}
                      />
                    </td>
                    <td>-</td>
                    <td className="text-right text-sm font-semibold text-ink-600">
                      ${Number(lineDraft.amount || 0).toFixed(2)}
                    </td>
                    <td>
                      <Button
                        className="!h-9 !rounded-md !px-3"
                        onClick={handleLineSubmit}
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        {editingLineId ? 'Update' : 'Add'}
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={7}>
                      <div className="px-4 py-4 text-sm text-ink-500">
                        Add line items above to build the expense before submitting it for approval.
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-line px-6 py-6">
              <div className="w-full max-w-[300px] text-right">
                <p className="text-sm text-ink-600">Total:</p>
                <p className="mt-1 text-[2.1rem] font-semibold tracking-[-0.05em] text-ink-950">
                  ${lineTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="odoo-receipt-pane">
            <div className="odoo-receipt-toolbar">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span>{file ? file.name : 'Receipt preview'}</span>
              </div>
              <button
                className="rounded bg-white/10 px-3 py-1"
                onClick={() => uploadRef.current?.click()}
                type="button"
              >
                Browse
              </button>
            </div>

            <div className="grid min-h-[420px] place-items-center p-6">
              {previewUrl ? (
                <img
                  alt="Receipt preview"
                  className="max-h-[360px] w-full rounded-sm bg-white object-contain p-4 shadow-card"
                  src={previewUrl}
                />
              ) : (
                <div className="space-y-3 text-center text-white/75">
                  <Paperclip className="mx-auto h-8 w-8" />
                  <p className="text-base font-medium text-white">Attach a receipt</p>
                  <p className="max-w-[240px] text-sm leading-6">
                    Drop in a PDF or image and keep the source document visible while editing the expense.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="odoo-panel p-4">
            <p className="text-sm font-semibold text-ink-950">Draft checklist</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-600">
              <li>Use the exact vendor name from the receipt.</li>
              <li>Add line items before splitting the expense.</li>
              <li>Submit only after the receipt and amount match.</li>
            </ul>
          </section>
        </aside>
      </div>

      <input
        ref={uploadRef}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => {
          const selectedFile = event.target.files?.[0]
          if (!selectedFile) {
            return
          }

          if (values.id) {
            onUploadReceipt(selectedFile)
          } else {
            onChange('localFile', selectedFile)
          }
        }}
        type="file"
      />

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
