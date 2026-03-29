import { getCategoryWorkspace } from '../../api/categories.api.js'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function CategoriesPage() {
  const { data, isLoading } = useMockResource(getCategoryWorkspace, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const columns = [
    { key: 'name', header: 'Category Name' },
    { key: 'code', header: 'Category Code' },
    { key: 'label', header: 'Description' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <PageTransition className="space-y-6">
      <Reveal>
        <ConfigurationTabs />
      </Reveal>

      <Reveal>
        <PageHeader
          description="Review active categories and usage distribution without exposing unfinished create or edit controls."
          eyebrow="Expense Categories"
          title="Category Management"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.78fr]">
        <Reveal>
          <DataTable columns={columns} rows={data.categories} />
        </Reveal>

        <Reveal className="space-y-6">
          <Card className="rounded-md bg-[#fbfbfc] p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
              Total Categories
            </p>
            <p className="mt-4 text-[3rem] font-semibold tracking-[-0.06em] text-ink-950">
              {data.summaryCount}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-ink-600">
              Rationalize duplicate labels before the next import cycle to keep reporting and policy rules predictable.
            </p>
          </Card>

          <Card className="p-5">
            <CardHeader>
              <CardTitle>Top Usage</CardTitle>
              <CardDescription>Most used categories in the current list.</CardDescription>
            </CardHeader>
            <div className="mt-6 space-y-5">
              {data.usage.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-800">{item.label}</span>
                    <span className="text-ink-500">{item.share}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#ece6e7]">
                    <div className={`h-3 rounded-full ${item.widthClass} ${item.toneClass}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
