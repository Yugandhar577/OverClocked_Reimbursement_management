import { ChevronRight, Download, Filter } from 'lucide-react'
import { getExpenseReports } from '../../api/reports.api.js'
import { SidebarFilters } from '../../components/admin/SidebarFilters.jsx'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'
import { cn } from '../../utils/cn.js'

const toneClasses = {
  brand: 'before:bg-brand-700 text-brand-900',
  aqua: 'before:bg-aqua-500 text-aqua-700',
  amber: 'before:bg-amber-500 text-amber-700',
}

export function ReportsPage() {
  const { data, isLoading } = useMockResource(getExpenseReports, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const activeMonth = data.monthGroups.find((group) => group.open) ?? data.monthGroups[0]

  const columns = [
    {
      key: 'report',
      header: 'Report Name',
      render: (row) => <span className="font-semibold text-brand-900">{row.report}</span>,
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <AvatarBadge
            className="h-9 w-9 rounded-xl text-[10px]"
            initials={row.initials}
            toneClass="bg-aqua-100 text-aqua-700"
          />
          <span className="font-medium text-ink-700">{row.employee}</span>
        </div>
      ),
    },
    { key: 'dateRange', header: 'Date Range' },
    {
      key: 'total',
      header: 'Total Amount',
      render: (row) => <span className="font-bold text-ink-950">{row.total}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <PageTransition className="flex flex-col gap-6 xl:flex-row">
      <Reveal className="xl:w-[18rem] xl:flex-none">
        <SidebarFilters
          footerActionLabel="Create Report"
          sections={[
            { label: 'Status', type: 'checkbox', items: data.statusFilters },
            {
              label: 'Employees',
              type: 'search-list',
              placeholder: 'Search team...',
              items: data.employees,
            },
          ]}
        />
      </Reveal>

      <div className="min-w-0 flex-1 space-y-8">
        <Reveal>
          <PageHeader
            actions={
              <>
                <Button size="sm" variant="secondary">
                  <Filter className="h-4 w-4" />
                  Group By
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </>
            }
            description="Review and approve employee reimbursement batches."
            title="Expense Reports"
          />
        </Reveal>

        <div className="grid gap-5 xl:grid-cols-3">
          {data.totals.map((item) => (
            <Reveal key={item.label}>
              <Card
                className={cn(
                  'relative overflow-hidden p-6 before:absolute before:inset-y-6 before:left-0 before:w-1 before:rounded-full',
                  toneClasses[item.tone],
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  {item.label}
                </p>
                <p className="mt-5 font-display text-[2.7rem] font-black tracking-[-0.05em] text-ink-950">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-medium text-ink-500">{item.reports}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand-800 shadow-soft"
              type="button"
            >
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
            <h2 className="font-display text-2xl font-black tracking-[-0.04em] text-ink-950">
              {activeMonth.month}
            </h2>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-900">
              {activeMonth.count}
            </span>
          </div>
          <DataTable rows={activeMonth.rows} columns={columns} />
        </Reveal>

        <Reveal className="space-y-3">
          {data.monthGroups
            .filter((group) => !group.open)
            .map((group) => (
              <button
                key={group.month}
                className="flex w-full items-center justify-between rounded-[24px] border border-white/70 bg-white/75 px-6 py-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                type="button"
              >
                <div className="flex items-center gap-4">
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                  <span className="font-display text-xl font-bold tracking-[-0.03em] text-ink-900">
                    {group.month}
                  </span>
                </div>
                <span className="rounded-full bg-[#f3eef0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                  {group.count}
                </span>
              </button>
            ))}
        </Reveal>
      </div>
    </PageTransition>
  )
}
