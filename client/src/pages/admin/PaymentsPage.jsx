import { Download, IndianRupee, ShieldCheck, Zap } from 'lucide-react'
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

export function PaymentsPage() {
  const { data, isLoading } = useMockResource(getPaymentsQueue, [])

  if (isLoading || !data) {
    return <LoadingPanel />
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
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Button
          size="sm"
          variant={row.action === 'Trigger' ? 'secondary' : 'ghost'}
        >
          {row.action}
        </Button>
      ),
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              <Button size="sm">
                <Zap className="h-4 w-4" />
                Trigger Batch Payment
              </Button>
            </>
          }
          description="Manage and execute outbound transfers for verified business expenses with approval-aware sequencing."
          eyebrow="Treasury Operations"
          title="Payments Queue"
        />
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-3">
        {data.stats.map((item, index) => (
          <Reveal key={item.label}>
            <Card
              className={`p-6 ${
                index === 2 ? 'bg-gradient-to-br from-brand-800 to-brand-700 text-white' : ''
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                  index === 2 ? 'text-white/70' : 'text-ink-500'
                }`}
              >
                {item.label}
              </p>
              <p
                className={`mt-4 font-display text-[2.8rem] font-black tracking-[-0.05em] ${
                  index === 2 ? 'text-white' : 'text-ink-950'
                }`}
              >
                {item.value}
              </p>
              <p className={`mt-2 text-sm ${index === 2 ? 'text-white/80' : 'text-ink-600'}`}>
                {item.note}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Card className="p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-950">
                Transaction Ledger
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Prioritize queue items by payout readiness and integration state.
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <Card className="flex h-full items-center gap-4 p-6">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-ink-950">Enterprise Grade Security</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">
                All payments are processed through approval-scoped channels with
                strong encryption and audit logs.
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="flex h-full items-center justify-between gap-5 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                Last Batch Run
              </p>
              <p className="mt-3 font-semibold text-ink-950">Today, 09:12 AM</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                Total Paid (MTD)
              </p>
              <p className="mt-3 flex items-center justify-end gap-1 font-display text-[2rem] font-black tracking-[-0.05em] text-aqua-700">
                <IndianRupee className="h-5 w-5" />
                24,82,000
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
