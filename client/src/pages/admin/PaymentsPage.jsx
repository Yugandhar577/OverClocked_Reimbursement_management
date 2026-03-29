import { Download, ShieldCheck } from 'lucide-react'
import { exportExpensesCsv } from '../../api/expense.api.js'
import { getPaymentsQueue } from '../../api/payments.api.js'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export function PaymentsPage() {
  const { data, isLoading } = useMockResource(getPaymentsQueue, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const handleExport = async () => {
    const blob = await exportExpensesCsv()
    downloadBlob(blob, 'settlement-queue.csv')
  }

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <AvatarBadge initials={row.initials} toneClass="bg-brand-100 text-brand-900" />
          <div>
            <p className="font-semibold text-ink-950">{row.employee}</p>
            <p className="text-sm text-ink-500">{row.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'submitted', header: 'Submitted Date' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-bold text-ink-950">{row.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <PageTransition className="space-y-6">
      <Reveal>
        <PageHeader
          actions={
            <Button onClick={handleExport} size="sm" variant="secondary">
              <Download className="h-4 w-4" />
              Export Settlements
            </Button>
          }
          description="Track approved reimbursements and settlement readiness without surfacing unused payment-provider controls."
          eyebrow="Treasury Operations"
          title="Settlement Queue"
        />
      </Reveal>

      <div className="grid gap-4 xl:grid-cols-3">
        {data.stats.map((item) => (
          <Reveal key={item.label}>
            <Card className="rounded-md bg-[#fbfbfc] p-5 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                {item.label}
              </p>
              <p className="mt-4 text-[2.1rem] font-semibold tracking-[-0.05em] text-ink-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-ink-600">{item.note}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Card className="p-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-950">
                Settlement Ledger
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Monitor approved payouts, processing items, and completed reimbursements.
              </p>
            </div>
            <Tabs defaultValue={data.tabs[0]}>
              <TabsList>
                {data.tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6">
            <DataTable rows={data.rows} columns={columns} />
          </div>
        </Card>
      </Reveal>

      <Reveal>
        <Card className="flex items-center gap-4 p-5">
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink-950">Audit-safe reimbursement trail</p>
            <p className="mt-1 text-sm leading-6 text-ink-600">
              Settlement status is preserved in the expense ledger so finance can reconcile approved payouts without external-provider noise in the UI.
            </p>
          </div>
        </Card>
      </Reveal>
    </PageTransition>
  )
}
