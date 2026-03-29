import { Plus } from 'lucide-react'
import { getCategoryWorkspace } from '../../api/categories.api.js'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { DataTable, RowActions } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Button } from '../../components/ui/button.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'

const palette = [
  'bg-[#7d496a]',
  'bg-[#128c84]',
  'bg-[#946428]',
  'bg-[#c2410c]',
  'bg-[#b91c1c]',
]

export function CategoriesPage() {
  const { data, isLoading } = useMockResource(getCategoryWorkspace, [])
  const isOpen = useAdminShellStore((state) => state.isCategoryDialogOpen)
  const openDialog = useAdminShellStore((state) => state.openCategoryDialog)
  const closeDialog = useAdminShellStore((state) => state.closeCategoryDialog)

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
    {
      key: 'actions',
      header: '',
      render: () => <RowActions />,
    },
  ]

  return (
    <>
      <PageTransition className="space-y-8">
        <Reveal>
          <ConfigurationTabs />
        </Reveal>

        <Reveal>
          <PageHeader
            actions={
              <Button onClick={openDialog}>
                <Plus className="h-4 w-4" />
                Create Category
              </Button>
            }
            description="Define and organize expense categories for tighter controls and cleaner reporting."
            eyebrow="Expense Categories"
            title="Category Management"
          />
        </Reveal>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.78fr]">
          <Reveal>
            <DataTable rows={data.categories} columns={columns} />
          </Reveal>

          <Reveal className="space-y-6">
            <Card className="bg-gradient-to-br from-brand-900 to-brand-700 p-6 text-white shadow-float">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                Total Categories
              </p>
              <p className="mt-4 font-display text-[4rem] font-black tracking-[-0.06em]">
                {data.summaryCount}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/82">
                Rationalize duplicate labels before the next import cycle to keep
                policy automation predictable.
              </p>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Top Usage</CardTitle>
                <CardDescription>Most used categories this month.</CardDescription>
              </CardHeader>
              <div className="mt-6 space-y-5">
                {data.usage.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink-800">{item.label}</span>
                      <span className="text-ink-500">{item.share}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#ece6e7]">
                      <div
                        className={`h-3 rounded-full ${item.widthClass} ${item.toneClass}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>
      </PageTransition>

      <Dialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog()
          }
        }}
        open={isOpen}
      >
        <DialogContent className="w-[min(92vw,36rem)] px-8 py-7">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new coding bucket for policy checks and expense routing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                Category Name
              </label>
              <Input placeholder="e.g. Office Supplies" />
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Category Code
                </label>
                <Input placeholder="e.g. OFF-001" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Color Label
                </label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-line bg-white px-3 shadow-soft">
                  {palette.map((colorClass, index) => (
                    <button
                      aria-label={`Select category color ${index + 1}`}
                      key={colorClass}
                      className={`h-6 w-6 rounded-full ring-offset-2 transition ${colorClass} ${
                        index === 0 ? 'ring-2 ring-brand-700' : ''
                      }`}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={closeDialog} variant="secondary">
              Discard
            </Button>
            <Button>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
