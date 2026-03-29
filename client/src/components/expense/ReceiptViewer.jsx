import {
  FileImage,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  SquareDashedMousePointer,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getReceiptAssetUrl } from '../../api/expense.api.js'

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

  return (
    <section className="odoo-receipt-pane h-full">
      <div className="odoo-receipt-toolbar">
        <div className="flex items-center gap-2">
          <SquareDashedMousePointer className="h-4 w-4" />
          <Search className="h-4 w-4" />
          <div className="rounded bg-white/10 px-3 py-1">
            {latestReceipt ? '1 of 1' : '0 of 0'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="h-4 w-4" />
          <Plus className="h-4 w-4" />
          <div className="rounded bg-white/10 px-3 py-1">Automatic Zoom</div>
        </div>
      </div>

      <div className="grid min-h-[640px] place-items-center bg-[#2b2d35] p-6">
        <div className="w-full max-w-[440px] rounded-sm bg-white p-6 shadow-[0_22px_50px_rgba(0,0,0,0.28)]">
          {isLoading ? (
            <div className="flex h-[520px] items-center justify-center gap-3 text-sm text-ink-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading receipt preview...
            </div>
          ) : assetUrl ? (
            <img
              alt="Receipt preview"
              className="mx-auto max-h-[520px] w-full object-contain"
              src={assetUrl}
            />
          ) : (
            <div className="flex h-[520px] flex-col items-center justify-center gap-3 text-center text-ink-600">
              <FileImage className="h-10 w-10 text-ink-400" />
              <p className="text-base font-medium text-ink-800">No receipt attached yet.</p>
              <p className="max-w-[240px] text-sm leading-6">
                Attach a file to view the scanned receipt in the side panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
