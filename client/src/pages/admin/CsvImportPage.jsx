import { AlertCircle, CheckCircle2, Download, LoaderCircle, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getCsvImportWorkspace } from '../../api/company.api.js'
import {
  downloadUserImportTemplate,
  finalizeUsersImport,
  previewUsersImport,
} from '../../api/users.api.js'
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

const roleOptions = ['ADMIN', 'FINANCE', 'MANAGER', 'EMPLOYEE']

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback
}

export function CsvImportPage() {
  const { data, isLoading } = useMockResource(getCsvImportWorkspace, [])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [preview, setPreview] = useState(null)
  const [rows, setRows] = useState([])
  const [importResult, setImportResult] = useState(null)

  const unresolvedRows = useMemo(
    () => rows.filter((row) => row.reportsToRaw && !row.reportsToEmail),
    [rows],
  )
  const readyRows = useMemo(
    () => rows.filter((row) => !row.reportsToRaw || row.reportsToEmail).length,
    [rows],
  )
  const positionSummary = useMemo(
    () => [...new Set(rows.map((row) => row.position).filter(Boolean))],
    [rows],
  )
  const managerOptions = preview?.managerOptions ?? []

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const handleDownloadTemplate = async () => {
    setFeedbackError('')
    setFeedbackMessage('')
    setIsDownloadingTemplate(true)

    try {
      const { blob, filename } = await downloadUserImportTemplate()
      downloadBlob(blob, filename)
      setFeedbackMessage('Template downloaded successfully.')
    } catch (error) {
      setFeedbackError(
        getErrorMessage(error, 'Unable to download the user import template right now.'),
      )
    } finally {
      setIsDownloadingTemplate(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setFeedbackError('Choose an XLSX or CSV employee file before previewing the hierarchy.')
      return
    }

    setIsAnalyzing(true)
    setFeedbackError('')
    setFeedbackMessage('')
    setImportResult(null)

    try {
      const result = await previewUsersImport(selectedFile)
      setPreview(result)
      setRows(result.rows ?? [])
      setFeedbackMessage(`Preview generated for ${result.rows?.length ?? 0} employees.`)
    } catch (error) {
      setPreview(null)
      setRows([])
      setFeedbackError(
        getErrorMessage(error, 'We could not analyze that workbook. Check the employee headers and try again.'),
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateRow = (email, updater) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.email !== email) {
          return row
        }

        return typeof updater === 'function' ? updater(row) : { ...row, ...updater }
      }),
    )
  }

  const handleFinalizeImport = async () => {
    if (!rows.length) {
      setFeedbackError('Run the preview step first so we can validate hierarchy assignments.')
      return
    }

    if (unresolvedRows.length) {
      setFeedbackError('Every row with a manager reference must be assigned before finalizing the import.')
      return
    }

    setIsImporting(true)
    setFeedbackError('')
    setFeedbackMessage('')

    try {
      const { result, message } = await finalizeUsersImport(rows)
      setImportResult(result)
      setFeedbackMessage(message)
    } catch (error) {
      setFeedbackError(
        getErrorMessage(error, 'Import failed while creating employee accounts.'),
      )
    } finally {
      setIsImporting(false)
    }
  }

  const columns = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-ink-950">{row.fullName}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
            {row.employeeCode ?? `ROW ${row.rowNumber}`}
          </p>
          <p className="text-sm text-ink-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Extracted Position',
      render: (row) => (
        <input
          className="w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none"
          onChange={(event) => updateRow(row.email, { position: event.target.value })}
          value={row.position ?? ''}
        />
      ),
    },
    {
      key: 'platformRole',
      header: 'Platform Role',
      render: (row) => (
        <select
          className="w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none"
          onChange={(event) => updateRow(row.email, { platformRole: event.target.value })}
          value={row.platformRole}
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department ?? 'Unassigned',
    },
    {
      key: 'reportsToEmail',
      header: 'Hierarchy Choice',
      render: (row) => {
        const rowOptions = managerOptions.filter((option) => option.email !== row.email)

        return (
          <select
            className="w-full rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none"
            onChange={(event) => {
              const nextEmail = event.target.value || null
              const nextOption = rowOptions.find((option) => option.email === nextEmail)

              updateRow(row.email, {
                reportsToEmail: nextEmail,
                reportsToLabel: nextOption?.label ?? row.reportsToRaw ?? null,
              })
            }}
            value={row.reportsToEmail ?? ''}
          >
            <option value="">No manager</option>
            {rowOptions.map((option) => (
              <option key={`${row.email}-${option.email}`} value={option.email}>
                {option.label} · {option.email}
              </option>
            ))}
          </select>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.reportsToRaw && !row.reportsToEmail ? 'danger' : 'aqua'}>
          {row.reportsToRaw && !row.reportsToEmail ? 'Needs manager' : 'Ready'}
        </Badge>
      ),
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <ConfigurationTabs />
      </Reveal>

      <Reveal>
        <PageHeader
          actions={
            <Button
              disabled={isDownloadingTemplate}
              onClick={handleDownloadTemplate}
              size="sm"
              variant="secondary"
            >
              {isDownloadingTemplate ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Template
            </Button>
          }
          description="Upload the Apex workbook or a CSV, inspect the extracted positions, then confirm who reports to whom before accounts are created."
          title="Employee Import Assistant"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <div className="space-y-6">
          <Reveal>
            <CSVUploader
              fileName={selectedFile?.name}
              isBusy={isAnalyzing || isImporting || isDownloadingTemplate}
              onSelectFile={(file) => {
                setSelectedFile(file)
                setPreview(null)
                setRows([])
                setImportResult(null)
                setFeedbackError('')
                setFeedbackMessage('')
              }}
            />
          </Reveal>

          {feedbackError ? (
            <div className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {feedbackError}
            </div>
          ) : null}

          {feedbackMessage ? (
            <div className="rounded-[20px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
              {feedbackMessage}
            </div>
          ) : null}

          {preview ? (
            <>
              {preview.warnings?.length ? (
                <Reveal>
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>Import Warnings</CardTitle>
                      <CardDescription>
                        Resolve manager matches or duplicates before finalizing.
                      </CardDescription>
                    </CardHeader>
                    <div className="mt-5 space-y-3">
                      {preview.warnings.map((warning) => (
                        <div
                          key={warning}
                          className="flex items-start gap-3 rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Reveal>
              ) : null}

              <Reveal>
                <DataTable columns={columns} rows={rows} />
              </Reveal>
            </>
          ) : (
            <Reveal>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>
                    The preview step reads your workbook before any users are written to Postgres.
                  </CardDescription>
                </CardHeader>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {data.mappings.map((mapping) => (
                    <div
                      key={mapping.field}
                      className="rounded-[24px] border border-line bg-[#fcf8f8] p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                        System Field
                      </p>
                      <p className="mt-2 font-semibold text-ink-900">{mapping.field}</p>
                      <p className="mt-3 text-sm text-ink-600">{mapping.mappedTo}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          )}
        </div>

        <Reveal className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
              <CardDescription>
                {preview
                  ? `${preview.format.toUpperCase()} · ${preview.sourceSheet}`
                  : `Manifest: ${data.manifest}`}
              </CardDescription>
            </CardHeader>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Preview Rows
                </p>
                <p className="mt-2 font-display text-[2.6rem] font-black tracking-[-0.05em] text-ink-950">
                  {rows.length || data.totalRows}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua-600">
                  Ready
                </p>
                <p className="mt-2 font-display text-[2.6rem] font-black tracking-[-0.05em] text-aqua-700">
                  {rows.length ? readyRows : data.readyRows}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-[#ece6e7]">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-aqua-700 to-aqua-400"
                style={{
                  width: rows.length ? `${Math.max((readyRows / rows.length) * 100, 8)}%` : '12%',
                }}
              />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>
                    {unresolvedRows.length
                      ? `${unresolvedRows.length} employees still need a confirmed manager.`
                      : preview
                        ? 'Every detected hierarchy reference has a match.'
                        : data.criticalError}
                  </span>
                </div>
              </div>
              <div className="rounded-[20px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>
                    {importResult
                      ? `${importResult.success} employee accounts created and credential emails queued.`
                      : 'Preview positions are editable before the import is finalized.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                className="w-full"
                disabled={!selectedFile || isAnalyzing || isImporting}
                onClick={handleAnalyze}
                size="lg"
                variant="secondary"
              >
                {isAnalyzing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze File
              </Button>
              <Button
                className="w-full"
                disabled={!rows.length || isImporting || isAnalyzing || unresolvedRows.length > 0}
                onClick={handleFinalizeImport}
                size="lg"
              >
                {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Finalize Import
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Extracted Positions</CardTitle>
              <CardDescription>These titles are parsed from the upload and can be adjusted above.</CardDescription>
            </CardHeader>
            <div className="mt-5 flex flex-wrap gap-3">
              {(positionSummary.length ? positionSummary : data.tips).map((item) => (
                <Badge key={item} variant={positionSummary.length ? 'aqua' : 'muted'}>
                  {item}
                </Badge>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
