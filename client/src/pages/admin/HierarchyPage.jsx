import { Download, List, Network, Search } from 'lucide-react'
import { getHierarchyWorkspace } from '../../api/company.api.js'
import { OrgChart } from '../../components/admin/OrgChart.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function HierarchyPage() {
  const { data, isLoading } = useMockResource(getHierarchyWorkspace, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <ConfigurationTabs />
      </Reveal>

      <Reveal>
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="secondary">
                <Network className="h-4 w-4" />
                Chart View
              </Button>
              <Button size="sm" variant="secondary">
                <List className="h-4 w-4" />
                List View
              </Button>
              <Button size="sm" variant="secondary">
                100%
              </Button>
            </>
          }
          description="Explore reporting lines, departmental alignment, and executive span of control."
          eyebrow="Structure"
          title="Hierarchy Visualization"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
        <Reveal>
          <OrgChart tree={data.tree} />
        </Reveal>

        <Reveal>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Filter View</CardTitle>
              <CardDescription>Refine the org map before export.</CardDescription>
            </CardHeader>

            <div className="mt-6 space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Find Employee
                </p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <Input className="pl-9" placeholder="Name, ID or role..." />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Departments
                </p>
                <div className="space-y-3">
                  {data.departments.map((department) => (
                    <label
                      key={department.label}
                      className="flex items-center justify-between gap-3 text-sm text-ink-700"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          checked={department.checked}
                          className="h-4 w-4 accent-brand-700"
                          readOnly
                          type="checkbox"
                        />
                        <span>{department.label}</span>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        {department.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Job Level
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {data.levels.map((level, index) => (
                    <Button
                      key={level}
                      variant={index === 0 ? 'default' : 'secondary'}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-gradient-to-br from-brand-900 to-brand-700 p-5 text-white shadow-float">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Hierarchy Export
                </p>
                <p className="mt-3 text-sm leading-6 text-white/82">
                  Download a presentation-ready PDF or SVG of the filtered org
                  chart.
                </p>
                <Button className="mt-5 w-full bg-white text-brand-900 hover:bg-white/95" size="lg">
                  <Download className="h-4 w-4" />
                  Generate PDF
                </Button>
              </div>

              <button
                className="w-full text-center text-sm font-semibold text-brand-800 transition hover:text-brand-950"
                type="button"
              >
                Reset All Filters
              </button>
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
