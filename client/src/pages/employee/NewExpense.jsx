import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ExpenseForm } from '../../components/expense/ExpenseForm.jsx'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { useExpenseStore } from '../../stores/expenseStore.js'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toFormState(expense, baseCurrency, prefill) {
  if (expense) {
    return {
      id: expense.id,
      title: expense.title ?? '',
      description: expense.description ?? '',
      totalAmount: String(expense.totalAmount ?? ''),
      currency: expense.currency ?? baseCurrency,
      categoryId: expense.categoryId ?? '',
      expenseDate: new Date(expense.expenseDate ?? Date.now()).toISOString().slice(0, 10),
      vendor: expense.expenseLines?.[0]?.vendor ?? prefill?.vendor ?? '',
      expenseLines: expense.expenseLines ?? [],
    }
  }

  return {
    id: prefill?.expenseId ?? '',
    title: prefill?.title ?? '',
    description: prefill?.description ?? '',
    totalAmount: prefill?.totalAmount ? String(prefill.totalAmount) : '',
    currency: prefill?.currency ?? baseCurrency,
    categoryId: '',
    expenseDate: prefill?.expenseDate ?? today(),
    vendor: prefill?.vendor ?? '',
    expenseLines: [],
  }
}

export function NewExpense() {
  const navigate = useNavigate()
  const location = useLocation()
  const baseCurrency = useAuthStore((state) => state.company?.baseCurrency ?? 'USD')
  const categories = useExpenseStore((state) => state.categories)
  const currencies = useExpenseStore((state) => state.currencies)
  const currentExpense = useExpenseStore((state) => state.currentExpense)
  const error = useExpenseStore((state) => state.error)
  const duplicateWarnings = useExpenseStore((state) => state.duplicateWarnings)
  const isSaving = useExpenseStore((state) => state.isSaving)
  const bootstrapReferenceData = useExpenseStore((state) => state.bootstrapReferenceData)
  const loadExpense = useExpenseStore((state) => state.loadExpense)
  const createDraft = useExpenseStore((state) => state.createDraft)
  const updateDraft = useExpenseStore((state) => state.updateDraft)
  const saveLine = useExpenseStore((state) => state.saveLine)
  const removeLine = useExpenseStore((state) => state.removeLine)
  const uploadAndProcessReceipt = useExpenseStore((state) => state.uploadAndProcessReceipt)
  const submitExpense = useExpenseStore((state) => state.submitExpense)

  const scanPrefill = location.state?.prefill
  const draftId = location.state?.expenseId
  const [file, setFile] = useState(location.state?.file ?? null)
  const [formState, setFormState] = useState(() => toFormState(null, baseCurrency, scanPrefill))
  const activeExpenseId = draftId ?? scanPrefill?.expenseId ?? formState.id

  useEffect(() => {
    bootstrapReferenceData().catch(() => {})
  }, [bootstrapReferenceData])

  useEffect(() => {
    if (activeExpenseId) {
      loadExpense(activeExpenseId).catch(() => {})
    }
  }, [activeExpenseId, loadExpense])

  useEffect(() => {
    const matchingExpense = activeExpenseId && currentExpense?.id === activeExpenseId ? currentExpense : null

    if (!matchingExpense && !scanPrefill && activeExpenseId) {
      return
    }

    setFormState(toFormState(matchingExpense, baseCurrency, scanPrefill))
  }, [activeExpenseId, baseCurrency, currentExpense, scanPrefill])

  const updateField = (field, value) => {
    if (field === 'localFile') {
      setFile(value)
      return
    }

    setFormState((current) => ({ ...current, [field]: value }))
  }

  const buildPayload = () => ({
    title: formState.title || 'Receipt expense',
    description: formState.description || null,
    totalAmount: Number(formState.totalAmount || 1),
    currency: formState.currency || baseCurrency,
    categoryId: formState.categoryId || null,
    expenseDate: new Date(formState.expenseDate || today()).toISOString(),
  })

  const ensureDraft = async () => {
    if (formState.id) {
      return formState.id
    }

    const draft = await createDraft(buildPayload())
    setFormState((current) => ({ ...current, id: draft.id }))
    return draft.id
  }

  const handleSave = async () => {
    const payload = buildPayload()

    if (formState.id) {
      const saved = await updateDraft(formState.id, payload)
      navigate(`/expenses/${saved.id}`, { replace: true })
      return
    }

    const created = await createDraft(payload)
    if (file) {
      await uploadAndProcessReceipt(created.id, file)
      setFile(null)
    }
    navigate(`/expenses/${created.id}`, { replace: true })
  }

  const handleUploadReceipt = async (selectedFile) => {
    const expenseId = await ensureDraft()
    const result = await uploadAndProcessReceipt(expenseId, selectedFile)
    const parsed = result.ocr ?? {}

    setFormState((current) => ({
      ...current,
      id: expenseId,
      title: parsed.vendor ? `Receipt from ${parsed.vendor}` : current.title,
      totalAmount: parsed.total || parsed.amount ? String(parsed.total ?? parsed.amount) : current.totalAmount,
      currency: parsed.currency ?? current.currency,
      vendor: parsed.vendor ?? current.vendor,
      expenseDate: parsed.date ? new Date(parsed.date).toISOString().slice(0, 10) : current.expenseDate,
    }))
  }

  const handleSubmit = async () => {
    const expenseId = await ensureDraft()
    await updateDraft(expenseId, buildPayload())
    const result = await submitExpense(expenseId)
    navigate(`/expenses/${result.expense.id}`, { replace: true })
  }

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {duplicateWarnings.length ? (
        <div className="rounded-[22px] bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Similar expenses were found. Review before final submission.
        </div>
      ) : null}

      <ExpenseForm
        categories={categories}
        currencies={currencies}
        file={file}
        isSaving={isSaving}
        onChange={updateField}
        onCreateDraft={ensureDraft}
        onDeleteLine={async (line) => {
          if (formState.id) {
            await removeLine(formState.id, line.id)
          }
        }}
        onSave={handleSave}
        onSaveLine={saveLine}
        onSubmit={handleSubmit}
        onUploadReceipt={handleUploadReceipt}
        values={formState}
      />
    </div>
  )
}
