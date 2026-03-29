import { Download, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { exportExpensesCsv } from '../../api/expense.api.js'
import { getAllExpenses } from '../../api/expenses.api.js'
import { SidebarFilters } from '../../components/admin/SidebarFilters.jsx'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button, buttonVariants } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

const highlightTone = {
  danger: 'bg-red-50 text-red-700',
  brand: 'bg-brand-50 text-brand-900',
  soft: 'bg-[#f6f3f5] text-ink-700',
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export function ExpensesPage() {
  const { data, isLoading } = useMockResource(getAllExpenses, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const handleExport = async () => {
    const blob = await exportExpensesCsv()
    downloadBlob(blob, 'company-expenses.csv')
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
  ]

  return (
    <PageTransition className="flex flex-col gap-6 xl:flex-row">
      <Reveal className="xl:w-[19rem] xl:flex-none">
        <SidebarFilters
          footerActionLabel={null}
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

      <div className="min-w-0 flex-1 space-y-6">
        <Reveal>
          <PageHeader
            actions={
              <>
                <Button onClick={handleExport} size="sm" variant="secondary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Link
                  className={buttonVariants({ size: 'sm' })}
                  to="/admin/import"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Link>
              </>
            }
            description="Track employee expenses across statuses without exposing employee-only creation actions inside the admin shell."
            eyebrow="Claims Workspace"
            title="Company Expenses"
          />
        </Reveal>

        <Reveal>
          <DataTable rows={data.rows} columns={columns} />
        </Reveal>

        <div className="grid gap-4 xl:grid-cols-3">
          {data.highlights.map((item) => (
            <Reveal key={item.label}>
              <Card className="min-h-[148px] rounded-md bg-[#fbfbfc] p-5 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  {item.label}
                </p>
                <p
                  className={
                    item.tone === 'soft'
                      ? 'mt-4 text-base font-semibold leading-7 text-ink-950'
                      : 'mt-4 text-[1.95rem] font-semibold tracking-[-0.05em] text-ink-950'
                  }
                >
                  {item.value}
                </p>
                <p
                  className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${highlightTone[item.tone]}`}
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
