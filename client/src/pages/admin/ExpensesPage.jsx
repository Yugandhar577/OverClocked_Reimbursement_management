import { Download, Plus } from 'lucide-react'
import { getAllExpenses } from '../../api/expenses.api.js'
import { SidebarFilters } from '../../components/admin/SidebarFilters.jsx'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { DataTable, RowActions } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

const highlightTone = {
  danger: 'bg-red-100 text-red-700',
  brand: 'bg-brand-100 text-brand-900',
  soft: 'bg-[#f2ecee] text-ink-700',
}

export function ExpensesPage() {
  const { data, isLoading } = useMockResource(getAllExpenses, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="font-semibold text-ink-700">{row.date}</span>,
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
          <span className="font-semibold text-ink-950">{row.employee}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <Badge variant="muted">{row.category}</Badge>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="italic text-ink-600">{row.description}</span>,
    },
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
      key: 'actions',
      header: '',
      className: 'w-12',
      render: () => <RowActions />,
    },
  ]

  return (
    <PageTransition className="flex flex-col gap-6 xl:flex-row">
      <Reveal className="xl:w-[19rem] xl:flex-none">
        <SidebarFilters
          footerActionLabel="New Expense"
          sections={[
            { label: 'Status', type: 'checkbox', items: data.statusFilters },
            {
              label: 'Employees',
              type: 'search-list',
              placeholder: 'Search employees...',
              items: data.employees,
            },
            { label: 'Category', type: 'pills', items: data.categories },
          ]}
        />
      </Reveal>

      <div className="min-w-0 flex-1 space-y-8">
        <Reveal>
          <PageHeader
            actions={
              <>
                <Button size="sm" variant="secondary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Create Expense
                </Button>
              </>
            }
            description="Review and manage employee expense claims from the current fiscal period."
            eyebrow="Claims Workspace"
            title="Company Expenses"
          />
        </Reveal>

        <Reveal>
          <DataTable rows={data.rows} columns={columns} />
        </Reveal>

        <div className="grid gap-5 xl:grid-cols-3">
          {data.highlights.map((item) => (
            <Reveal key={item.label}>
              <Card className="p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-500">
                  {item.label}
                </p>
                <p className="mt-4 font-display text-[2.4rem] font-black tracking-[-0.05em] text-ink-950">
                  {item.value}
                </p>
                <p
                  className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${highlightTone[item.tone]}`}
                >
                  {item.note}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
