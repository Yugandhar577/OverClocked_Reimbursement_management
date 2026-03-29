import { Download, Plus } from 'lucide-react'
import { getDashboardSummary } from '../../api/dashboard.api.js'
import { AnalyticsCards } from '../../components/admin/AnalyticsCards.jsx'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function DashboardPage() {
  const { data, isLoading } = useMockResource(getDashboardSummary, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="secondary">
                Last 30 Days
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </>
          }
          description="Monitor reimbursement velocity, spend mix, and approval activity across the enterprise."
          eyebrow="Overview Dashboard"
          title="Executive Summary"
        />
      </Reveal>

      <Reveal>
        <AnalyticsCards cards={data.kpis} />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.65fr_0.9fr]">
        <Reveal>
          <Card className="p-6">
            <CardHeader className="mb-8">
              <CardTitle>Monthly Spend Trend</CardTitle>
              <CardDescription>
                Current cycle versus previous quarter baseline.
              </CardDescription>
            </CardHeader>
            <div className="grid min-h-[19rem] grid-cols-7 items-end gap-4">
              {data.trend.map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-3">
                  <div className="flex h-56 items-end gap-2">
                    <div
                      className={`w-6 rounded-t-full bg-[#ede5e7] ${item.previousHeight}`}
                    />
                    <div
                      className={`w-6 rounded-t-full bg-gradient-to-t from-brand-800 to-brand-500 ${item.currentHeight}`}
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
              <CardDescription>Live reimbursement share this cycle.</CardDescription>
            </CardHeader>
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="category-ring grid h-52 w-52 place-items-center rounded-full">
                <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-inner">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">
                      Total
                    </p>
                    <p className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-ink-950">
                      100%
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-3">
                {data.categoryBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                      <span className="font-medium text-ink-700">{item.label}</span>
                    </div>
                    <span className="font-semibold text-ink-950">{item.share}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.92fr]">
        <Reveal>
          <Card className="p-6">
            <CardHeader className="mb-7">
              <CardTitle>Spend by Department</CardTitle>
              <CardDescription>
                Funding concentration across major teams.
              </CardDescription>
            </CardHeader>
            <div className="space-y-6">
              {data.departments.map((department) => (
                <div key={department.name} className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="uppercase tracking-[0.16em] text-ink-500">
                      {department.name}
                    </span>
                    <span className="text-ink-950">{department.amount}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#ece6e7]">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r from-brand-800 to-brand-500 ${department.widthClass}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="relative p-6">
            <CardHeader className="mb-6">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Approval events and submissions that changed the queue.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {data.activity.map((item) => (
                <div
                  key={`${item.actor}-${item.subject}`}
                  className="flex items-start gap-4 rounded-[24px] bg-[#fbf8f8] px-4 py-4"
                >
                  <AvatarBadge initials={item.actor.slice(0, 2)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-700">
                      <span className="font-semibold text-ink-950">{item.actor}</span>{' '}
                      {item.action}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">{item.subject}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${item.toneClass}`}
                      >
                        {item.amount}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="absolute bottom-8 right-8 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-800 to-brand-700 text-white shadow-float transition hover:-translate-y-1"
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Create activity shortcut</span>
            </button>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
