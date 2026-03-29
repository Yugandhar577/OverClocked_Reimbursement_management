import { Camera, Paperclip, Upload } from 'lucide-react'

export function FileUpload({ file, helperText, onFileSelect }) {
  const handleChange = (event) => {
    const nextFile = event.target.files?.[0]

    if (nextFile) {
      onFileSelect(nextFile)
    }
  }

  return (
    <label className="surface-soft flex cursor-pointer flex-col gap-3 p-4 transition hover:border-brand-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Receipt Upload</p>
          <p className="mt-1 text-sm text-ink-700">
            {file ? file.name : 'Attach a receipt image for OCR and traceability.'}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-soft">
          <Upload className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
          <Camera className="h-4 w-4 text-aqua-600" />
          Camera
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
          <Paperclip className="h-4 w-4 text-brand-700" />
          Files
        </span>
      </div>

      {helperText ? <p className="text-sm leading-6 text-ink-600">{helperText}</p> : null}

      <input accept="image/*,application/pdf" className="hidden" onChange={handleChange} type="file" />
    </label>
  )
}
