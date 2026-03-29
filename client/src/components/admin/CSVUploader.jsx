import { Download, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '../ui/button.jsx'

export function CSVUploader({
  fileName,
  isUploading = false,
  onDownloadTemplate,
  onSelectFile,
}) {
  const inputRef = useRef(null)

  return (
    <div className="surface-card flex min-h-[15rem] flex-col items-center justify-center border border-dashed border-line bg-[#fcfcfd] px-8 py-10 text-center">
      <div className="rounded-md bg-brand-50 p-4 text-brand-800">
        <UploadCloud className="h-7 w-7" />
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink-950">
          Upload expense records
        </h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-ink-600">
          Upload a CSV file with employee email, title, amount, date, and optional category columns to create expense records in bulk.
        </p>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button disabled={isUploading} onClick={() => inputRef.current?.click()}>
          <FileSpreadsheet className="h-4 w-4" />
          {fileName ? 'Replace file' : 'Browse CSV'}
        </Button>
        <Button onClick={onDownloadTemplate} variant="secondary">
          <Download className="h-4 w-4" />
          Template
        </Button>
        <input
          ref={inputRef}
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              onSelectFile?.(file)
            }
            event.target.value = ''
          }}
          type="file"
        />
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">
          CSV only, max 25MB
        </p>
        {fileName ? <p className="text-sm text-ink-600">Selected: {fileName}</p> : null}
      </div>
    </div>
  )
}
