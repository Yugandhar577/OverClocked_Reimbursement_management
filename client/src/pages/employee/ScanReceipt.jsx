import { Camera, LoaderCircle, ScanSearch } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button.jsx'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { useExpenseStore } from '../../stores/expenseStore.js'

function buildPlaceholderPayload(baseCurrency) {
  return {
    title: 'Scanned receipt draft',
    description: 'Temporary draft created for receipt OCR.',
    totalAmount: 1,
    currency: baseCurrency,
    categoryId: null,
    expenseDate: new Date().toISOString(),
  }
}

export function ScanReceipt() {
  const navigate = useNavigate()
  const baseCurrency = useAuthStore((state) => state.company?.baseCurrency ?? 'USD')
  const createDraft = useExpenseStore((state) => state.createDraft)
  const updateDraft = useExpenseStore((state) => state.updateDraft)
  const uploadAndProcessReceipt = useExpenseStore((state) => state.uploadAndProcessReceipt)
  const error = useExpenseStore((state) => state.error)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)

  const warnings = useMemo(() => ocrResult?.warnings ?? [], [ocrResult])

  const handleFileSelection = (event) => {
    const nextFile = event.target.files?.[0]

    if (!nextFile) {
      return
    }

    setFile(nextFile)
    setOcrResult(null)
    setPreview(URL.createObjectURL(nextFile))
  }

  const handleProcess = async () => {
    if (!file) {
      return
    }

    setIsProcessing(true)

    try {
      const draft = await createDraft(buildPlaceholderPayload(baseCurrency))
      const { ocr } = await uploadAndProcessReceipt(draft.id, file)
      const nextPayload = {
        title: ocr?.vendor ? `Receipt from ${ocr.vendor}` : 'Scanned receipt draft',
        description: ocr?.rawText ? `OCR imported from receipt.\n\n${ocr.rawText.slice(0, 280)}` : 'Receipt imported from mobile scan.',
        totalAmount: Number(ocr?.total ?? ocr?.amount ?? 1),
        currency: ocr?.currency ?? baseCurrency,
        categoryId: null,
        expenseDate: new Date(ocr?.date ?? Date.now()).toISOString(),
      }

      await updateDraft(draft.id, nextPayload)
      setOcrResult(ocr)
      navigate('/expenses/new', {
        replace: true,
        state: {
          expenseId: draft.id,
          prefill: {
            expenseId: draft.id,
            title: nextPayload.title,
            description: nextPayload.description,
            totalAmount: nextPayload.totalAmount,
            currency: nextPayload.currency,
            expenseDate: new Date(nextPayload.expenseDate).toISOString().slice(0, 10),
            vendor: ocr?.vendor ?? '',
          },
        },
      })
    } catch {
      setOcrResult(null)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      <label className="surface-card flex cursor-pointer flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Capture</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
              Scan a receipt
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-brand-900 text-white shadow-float">
            <Camera className="h-5 w-5" />
          </div>
        </div>

        <p className="text-sm leading-6 text-ink-600">
          Choose a photo or PDF. The app will create a lightweight draft, run OCR, and take you to a prefilled expense form.
        </p>

        <div className="rounded-[24px] border border-dashed border-brand-200 bg-brand-50/70 px-4 py-8 text-center text-sm text-ink-600">
          {file ? file.name : 'Tap to open camera, gallery, or files'}
        </div>

        <input accept="image/*,application/pdf" className="hidden" onChange={handleFileSelection} type="file" />
      </label>

      {preview ? (
        <div className="surface-card p-4">
          <img alt="Receipt preview" className="max-h-80 w-full rounded-[20px] object-contain" src={preview} />
        </div>
      ) : null}

      {error ? <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {warnings.length ? (
        <div className="rounded-[22px] bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {warnings.join(' ')}
        </div>
      ) : null}

      <Button className="w-full" disabled={!file || isProcessing} onClick={handleProcess} size="lg">
        {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
        {isProcessing ? 'Processing receipt...' : 'Run OCR and open draft'}
      </Button>
    </div>
  )
}
