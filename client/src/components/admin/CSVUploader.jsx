import { FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '../ui/button.jsx'

export function CSVUploader({ fileName, isBusy = false, onSelectFile }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0]

    if (nextFile && onSelectFile) {
      onSelectFile(nextFile)
    }

    event.target.value = ''
  }

  return (
    <div className="surface-card flex min-h-[15rem] flex-col items-center justify-center border border-dashed border-brand-100/90 bg-[radial-gradient(circle_at_top,#fff_0%,#faf6f8_100%)] px-8 py-10 text-center">
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-800">
        <UploadCloud className="h-7 w-7" />
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-950">
          Upload your transaction manifest
        </h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-ink-600">
          Drag and drop your CSV or XLSX file here to begin the ingestion
          process.
        </p>
        {fileName ? (
          <p className="text-sm font-semibold text-brand-800">Selected: {fileName}</p>
        ) : null}
      </div>
      <div className="mt-7 flex flex-col items-center gap-3">
        <Button disabled={isBusy} onClick={openPicker}>
          <FileSpreadsheet className="h-4 w-4" />
          Browse files
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">
          Max file size: 25MB
        </p>
      </div>
      <input
        accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}
