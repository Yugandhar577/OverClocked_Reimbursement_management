import { AlertCircle, CheckCircle2, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  downloadExpenseImportTemplate,
  exportExpensesCsv,
  importExpensesCsv,
} from '../../api/expense.api.js'
import { getCsvImportWorkspace } from '../../api/company.api.js'
import { CSVUploader } from '../../components/admin/CSVUploader.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      current += '"'
      index += 1
      continue
    }

    if (character === '"') {
      insideQuotes = !insideQuotes
      continue
    }

    if (character === ',' && !insideQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  values.push(current.trim())
  return values
}

function analyzeCsv(content) {
  const cleaned = content.replace(/^\uFEFF/, '').trim()

  if (!cleaned) {
    return {
      totalRows: 0,
      readyRows: 0,
      criticalError: 'The uploaded file is empty.',
      mappings: [],
      previewRows: [],
      missingFields: ['employeeEmail', 'title', 'amount', 'expenseDate'],
    }
  }

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return {
      totalRows: 0,
      readyRows: 0,
      criticalError: 'Add at least one data row below the CSV header.',
      mappings: [],
      previewRows: [],
      missingFields: ['employeeEmail', 'title', 'amount', 'expenseDate'],
    }
  }

  const rawHeaders = parseCsvLine(lines[0])
  const normalizedHeaders = rawHeaders.map(normalizeHeader)
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    const values = {}
    normalizedHeaders.forEach((header, index) => {
      values[header] = cells[index] ?? ''
    })
    return values
  })

  const fieldMap = [
    {
      field: 'Employee',
      aliases: ['employeeemail', 'employee_email', 'email'],
    },
    {
      field: 'Title',
      aliases: ['title', 'merchant', 'description'],
    },
    {
      field: 'Amount',
      aliases: ['amount', 'totalamount', 'total_amount', 'amountval'],
    },
    {
      field: 'Expense Date',
      aliases: ['expensedate', 'expense_date', 'date', 'dateposted'],
    },
  ]

  const mappings = fieldMap.map((mapping) => {
    const match = mapping.aliases.find((alias) => normalizedHeaders.includes(alias))

    return {
      field: mapping.field,
      mappedTo: match ? rawHeaders[normalizedHeaders.indexOf(match)] : 'Not mapped',
      status: match ? 'mapped' : 'pending',
    }
  })

  const missingFields = mappings
    .filter((mapping) => mapping.status !== 'mapped')
    .map((mapping) => mapping.field)

  const previewRows = rows.slice(0, 5).map((row) => ({
    employee: row.employeeemail || row.employee_email || row.email || 'Missing',
    title: row.title || row.merchant || row.description || 'Missing',
    amount: row.amount || row.totalamount || row.total_amount || row.amountval || 'Missing',
    date: row.expensedate || row.expense_date || row.date || row.dateposted || 'Missing',
    status:
      row.employeeemail || row.employee_email || row.email
        ? 'Ready'
        : 'Missing Employee',
  }))

  return {
    totalRows: rows.length,
    readyRows: Math.max(rows.length - missingFields.length, 0),
    criticalError: missingFields.length
      ? `Missing required mapping for ${missingFields.join(', ')}.`
      : '',
    mappings,
    previewRows,
    missingFields,
  }
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.URL.revokeObjectURL(url)
}

function getProgressWidthClass(totalRows, readyRows) {
  if (!totalRows) {
    return 'w-[8%]'
  }

  const ratio = readyRows / totalRows

  if (ratio >= 0.9) {
    return 'w-[96%]'
  }

  if (ratio >= 0.7) {
    return 'w-[76%]'
  }

  if (ratio >= 0.5) {
    return 'w-[56%]'
  }

  if (ratio >= 0.3) {
    return 'w-[36%]'
  }

  return 'w-[18%]'
}

export function CsvImportPage() {
  const { data, isLoading } = useMockResource(getCsvImportWorkspace, [])
  const [file, setFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [previewState, setPreviewState] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [result, setResult] = useState(null)
  const [pageError, setPageError] = useState('')

  const columns = [
    { key: 'employee', header: 'Employee Email' },
    { key: 'title', header: 'Title' },
    { key: 'amount', header: 'Amount' },
    { key: 'date', header: 'Expense Date' },
    {
      key: 'status',
      header: 'Row Status',
      render: (row) => (
        <Badge variant={row.status === 'Ready' ? 'aqua' : 'danger'}>{row.status}</Badge>
      ),
    },
  ]

  const currentPreview = useMemo(() => previewState ?? data, [data, previewState])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const handleSelectFile = async (selectedFile) => {
    setPageError('')
    setResult(null)
    setFile(selectedFile)

    try {
      const content = await selectedFile.text()
      setFileContent(content)
      setPreviewState(analyzeCsv(content))
    } catch (error) {
      setPreviewState(null)
      setPageError(error.message ?? 'Unable to read the selected CSV file.')
    }
  }

  const handleValidate = () => {
    if (!fileContent) {
      setPageError('Select a CSV file first.')
      return
    }

    setPreviewState(analyzeCsv(fileContent))
    setPageError('')
  }

  const handleImport = async () => {
    if (!file) {
      setPageError('Select a CSV file before importing.')
      return
    }

    if (currentPreview.missingFields?.length) {
      setPageError('Resolve the missing CSV mappings before importing.')
      return
    }

    try {
      setIsImporting(true)
      setPageError('')
      const importResult = await importExpensesCsv(file)
      setResult(importResult)
    } catch (error) {
      setPageError(error.response?.data?.message ?? error.message ?? 'CSV import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      setPageError('')
      const blob = await downloadExpenseImportTemplate()
      downloadBlob(blob, 'expense-import-template.csv')
    } catch (error) {
      setPageError(error.response?.data?.message ?? error.message ?? 'Unable to download the template.')
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setPageError('')
      const blob = await exportExpensesCsv()
      downloadBlob(blob, 'expenses-export.csv')
    } catch (error) {
      setPageError(error.response?.data?.message ?? error.message ?? 'Unable to export expenses.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageTransition className="space-y-6">
      <Reveal>
        <ConfigurationTabs />
      </Reveal>

      <Reveal>
        <PageHeader
          actions={
            <Button onClick={handleExport} size="sm" variant="secondary">
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          }
          description="Import and export expenses in bulk without relying on placeholder UI. Use the template to map employee email, title, amount, and date."
          title="CSV Import Assistant"
        />
      </Reveal>

      {pageError ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</div>
      ) : null}

      {result ? (
        <div className="rounded-md bg-aqua-50 px-4 py-3 text-sm text-aqua-800">
          Imported {result.created} expenses. {result.failed} rows failed.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.82fr]">
        <div className="space-y-6">
          <Reveal>
            <CSVUploader
              fileName={file?.name}
              isUploading={isImporting}
              onDownloadTemplate={handleDownloadTemplate}
              onSelectFile={handleSelectFile}
            />
          </Reveal>

          <Reveal>
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Schema Mapping</CardTitle>
                <CardDescription>
                  The import is considered valid only when all required fields are mapped.
                </CardDescription>
              </CardHeader>
              <div className="mt-6 space-y-4">
                {currentPreview.mappings.map((mapping) => (
                  <div
                    key={mapping.field}
                    className="grid gap-4 rounded-md border border-line bg-[#fcf8f8] p-4 md:grid-cols-[1fr_1.2fr]"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                        System Field
                      </p>
                      <p className="mt-2 font-semibold text-ink-900">{mapping.field}</p>
                    </div>
                    <div className="rounded-md border border-line bg-white px-4 py-3 shadow-soft">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink-700">{mapping.mappedTo}</span>
                        <Badge variant={mapping.status === 'mapped' ? 'aqua' : 'muted'}>
                          {mapping.status === 'mapped' ? 'Mapped' : 'Missing'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal>
            <DataTable columns={columns} rows={currentPreview.previewRows} />
          </Reveal>
        </div>

        <Reveal className="space-y-6">
          <Card className="p-5">
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
              <CardDescription>
                {file ? `Selected file: ${file.name}` : `Manifest: ${data.manifest}`}
              </CardDescription>
            </CardHeader>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Total Rows
                </p>
                <p className="mt-2 text-[2.35rem] font-semibold tracking-[-0.05em] text-ink-950">
                  {currentPreview.totalRows}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua-600">
                  Ready
                </p>
                <p className="mt-2 text-[2.35rem] font-semibold tracking-[-0.05em] text-aqua-700">
                  {currentPreview.readyRows}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-[#ece6e7]">
              <div
                className={`h-2 rounded-full bg-gradient-to-r from-aqua-700 to-aqua-400 ${getProgressWidthClass(
                  currentPreview.totalRows,
                  currentPreview.readyRows,
                )}`}
              />
            </div>

            <div className="mt-5 space-y-3">
              {currentPreview.criticalError ? (
                <div className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                    <span>{currentPreview.criticalError}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                    <span>Required fields are mapped and the file is ready to import.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={handleValidate} size="lg" variant="secondary">
                Validate File
              </Button>
              <Button
                className="w-full"
                disabled={isImporting || !file || currentPreview.missingFields?.length > 0}
                onClick={handleImport}
                size="lg"
              >
                {isImporting ? 'Importing...' : 'Import Expenses'}
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader>
              <CardTitle>Required Columns</CardTitle>
              <CardDescription>Use these headers in your CSV template.</CardDescription>
            </CardHeader>
            <div className="mt-5 space-y-3 text-sm leading-6 text-ink-600">
              <p>`employeeEmail`, `title`, `amount`, and `expenseDate` are required.</p>
              <p>`description`, `currency`, `categoryCode`, `categoryName`, and `status` are optional.</p>
              <p>For admin imports, every row must target an employee or manager email already present in the company directory.</p>
            </div>
          </Card>

          {result?.errors?.length ? (
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Import Errors</CardTitle>
                <CardDescription>Rows that were skipped during the last upload.</CardDescription>
              </CardHeader>
              <div className="mt-5 space-y-3">
                {result.errors.slice(0, 6).map((item) => (
                  <div key={`${item.row}-${item.message}`} className="rounded-md bg-[#faf6f7] px-4 py-3 text-sm text-ink-700">
                    Row {item.row}: {item.message}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </Reveal>
      </div>
    </PageTransition>
  )
}
