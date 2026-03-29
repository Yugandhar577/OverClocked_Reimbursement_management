import { AlertCircle, CheckCircle2 } from 'lucide-react'
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

export function CsvImportPage() {
  const { data, isLoading } = useMockResource(getCsvImportWorkspace, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const columns = [
    { key: 'date', header: 'Date (Mapped)' },
    { key: 'merchant', header: 'Merchant (Mapped)' },
    { key: 'amount', header: 'Amount (Mapped)' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Valid' ? 'aqua' : 'danger'}>{row.status}</Badge>
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
          description="Map your transaction data to enterprise compliance standards before it reaches approvals."
          title="CSV Import Assistant"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.82fr]">
        <div className="space-y-6">
          <Reveal>
            <CSVUploader />
          </Reveal>

          <Reveal>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Schema Mapping</CardTitle>
                <CardDescription>
                  Align CSV headers with required system fields.
                </CardDescription>
              </CardHeader>
              <div className="mt-6 space-y-4">
                {data.mappings.map((mapping) => (
                  <div
                    key={mapping.field}
                    className="grid gap-4 rounded-[24px] border border-line bg-[#fcf8f8] p-4 md:grid-cols-[1fr_1.2fr]"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                        System Field
                      </p>
                      <p className="mt-2 font-semibold text-ink-900">{mapping.field}</p>
                    </div>
                    <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-soft">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-ink-700">
                          {mapping.mappedTo}
                        </span>
                        <Badge
                          variant={mapping.status === 'mapped' ? 'aqua' : 'muted'}
                        >
                          {mapping.status === 'mapped' ? 'Mapped' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal>
            <DataTable rows={data.previewRows} columns={columns} />
          </Reveal>
        </div>

        <Reveal className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
              <CardDescription>Manifest: {data.manifest}</CardDescription>
            </CardHeader>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Total Rows
                </p>
                <p className="mt-2 font-display text-[2.6rem] font-black tracking-[-0.05em] text-ink-950">
                  {data.totalRows}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-aqua-600">
                  Ready
                </p>
                <p className="mt-2 font-display text-[2.6rem] font-black tracking-[-0.05em] text-aqua-700">
                  {data.readyRows}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-[#ece6e7]">
              <div className="h-2 w-[96%] rounded-full bg-gradient-to-r from-aqua-700 to-aqua-400" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span>{data.criticalError}</span>
                </div>
              </div>
              <div className="rounded-[20px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  <span>Columns mapped successfully for required fields.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full" size="lg" variant="secondary">
                Validate Data
              </Button>
              <Button className="w-full" size="lg">
                Finalize Import
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Pro Tips</CardTitle>
              <CardDescription>Shortcuts for cleaner imports.</CardDescription>
            </CardHeader>
            <div className="mt-5 space-y-4">
              {data.tips.map((tip) => (
                <p key={tip} className="text-sm leading-6 text-ink-600">
                  {tip}
                </p>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
