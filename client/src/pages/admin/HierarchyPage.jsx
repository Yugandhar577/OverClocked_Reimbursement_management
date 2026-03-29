import { Building2, Users2 } from 'lucide-react'
import { getHierarchyWorkspace } from '../../api/company.api.js'
import { OrgChart } from '../../components/admin/OrgChart.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function HierarchyPage() {
  const { data, isLoading } = useMockResource(getHierarchyWorkspace, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  return (
    <PageTransition className="space-y-6">
      <Reveal>
        <ConfigurationTabs />
      </Reveal>

      <Reveal>
        <PageHeader
          description="Explore reporting lines, departmental alignment, and executive span of control without the unfinished filter widgets."
          eyebrow="Structure"
          title="Hierarchy Visualization"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr]">
        <Reveal>
          <OrgChart tree={data.tree} />
        </Reveal>

        <Reveal>
          <Card className="p-5">
            <CardHeader>
              <CardTitle>Structure Snapshot</CardTitle>
              <CardDescription>High-level organization context for the active chart.</CardDescription>
            </CardHeader>

            <div className="mt-6 space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Primary Leader
                </p>
                <div className="rounded-md border border-line bg-[#fbfbfc] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-brand-700" />
                    <div>
                      <p className="font-semibold text-ink-950">{data.tree.leader.name}</p>
                      <p className="text-sm text-ink-500">{data.tree.leader.title}</p>
                    </div>
                  </div>
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
                  Job Levels
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {data.levels.map((level) => (
                    <div
                      key={level}
                      className="rounded-md border border-line bg-[#fbfbfc] px-4 py-3 text-center text-sm font-semibold text-ink-700"
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-[#fbfbfc] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Reporting Coverage
                </p>
                <div className="mt-3 flex items-center gap-3 text-ink-700">
                  <Users2 className="h-4 w-4 text-brand-700" />
                  <p className="text-sm leading-6">
                    {data.flatCount ? `${data.flatCount} people represented across the visible reporting tree.` : 'The current chart shows the available reporting structure.'}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-500">
                  Use the employee directory and approval rules pages for deeper operational changes.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
