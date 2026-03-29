import { ExternalLink, FileImage, LoaderCircle, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getReceiptAssetUrl } from '../../api/expense.api.js'
import { CurrencyDisplay } from './CurrencyDisplay.jsx'

export function ReceiptViewer({ receipts = [] }) {
  const [assetUrl, setAssetUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const latestReceipt = receipts[0] ?? null

  useEffect(() => {
    let cancelled = false

    if (!latestReceipt?.id) {
      setAssetUrl('')
      return () => {}
    }

    setIsLoading(true)
    getReceiptAssetUrl(latestReceipt.id)
      .then((url) => {
        if (!cancelled) {
          setAssetUrl(url ?? '')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAssetUrl('')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [latestReceipt?.id])

  const ocr = latestReceipt?.ocrData ?? {}

  return (
    <section className="surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Receipt Viewer</p>
          <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.04em] text-ink-950">
            Latest attachment
          </h3>
        </div>
        {assetUrl ? (
          <a
            className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-900"
            href={assetUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <div className="mt-4 rounded-[24px] border border-dashed border-brand-100 bg-[#fbf7fa] p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading receipt preview...
          </div>
        ) : assetUrl ? (
          <img alt="Receipt preview" className="max-h-64 w-full rounded-[18px] object-contain" src={assetUrl} />
        ) : (
          <div className="flex items-center gap-3 text-sm text-ink-600">
            <FileImage className="h-5 w-5 text-brand-700" />
            No preview available yet.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] bg-aqua-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aqua-700">Vendor</p>
          <p className="mt-1 text-sm font-semibold text-ink-950">{ocr.vendor ?? latestReceipt?.fileName ?? 'Pending OCR'}</p>
        </div>
        <div className="rounded-[20px] bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Detected Total</p>
          <p className="mt-1 text-sm font-semibold text-ink-950">
            {ocr.total || ocr.amount ? <CurrencyDisplay amount={ocr.total ?? ocr.amount} currency={ocr.currency} /> : 'Pending OCR'}
          </p>
        </div>
      </div>

      {latestReceipt?.ocrStatus ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-600">
          <ReceiptText className="h-4 w-4 text-amber-600" />
          OCR status: {latestReceipt.ocrStatus}
        </div>
      ) : null}
    </section>
  )
}
