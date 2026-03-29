import { Plus } from 'lucide-react'
import { getApprovalRulesWorkspace } from '../../api/approval-rules.api.js'
import { ApprovalRuleBuilder } from '../../components/admin/ApprovalRuleBuilder.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Switch } from '../../components/ui/switch.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function ApprovalRulesPage() {
  const { data, isLoading } = useMockResource(getApprovalRulesWorkspace, [])

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
                Discard
              </Button>
              <Button size="sm">Save Rule</Button>
            </>
          }
          description="Define the workflow and thresholds for corporate travel expenses."
          title="Executive Travel Policy"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_0.8fr_1.35fr]">
        <Reveal>
          <Card className="p-6">
            <CardHeader className="mb-6 flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Approval Rules</CardTitle>
                <CardDescription>Select a policy to edit.</CardDescription>
              </div>
              <button
                className="rounded-xl p-2 text-brand-700 transition hover:bg-brand-50"
                type="button"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create rule</span>
              </button>
            </CardHeader>

            <div className="space-y-4">
              {data.rules.map((rule) => (
                <button
                  key={rule.name}
                  className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                    rule.active
                      ? 'border-brand-200 bg-white shadow-card'
                      : 'border-transparent bg-[#faf6f7] hover:border-brand-100'
                  }`}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-950">{rule.name}</p>
                      <p className="mt-2 text-sm leading-6 text-ink-600">
                        {rule.description}
                      </p>
                    </div>
                    {rule.active ? <Badge variant="aqua">Active</Badge> : null}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                    {rule.version}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>General Controls</CardTitle>
              <CardDescription>Refine reviewer behavior and auto-approval.</CardDescription>
            </CardHeader>

            <div className="mt-7 space-y-6">
              {data.controls.map((control) => (
                <div
                  key={control.label}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-ink-900">{control.label}</p>
                    <p className="text-sm text-ink-500">Policy-level control</p>
                  </div>
                  <Switch checked={control.enabled} onCheckedChange={() => {}} />
                </div>
              ))}

              <div className="rounded-[24px] bg-[#fbf8f8] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Threshold For Auto-Approval
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <input
                    className="h-2 w-full cursor-pointer accent-brand-700"
                    defaultValue={15}
                    max="30"
                    min="0"
                    type="range"
                  />
                  <span className="font-display text-2xl font-black tracking-[-0.04em] text-brand-900">
                    {data.threshold}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-ink-500">
                  Expenses within the configured variance can bypass manual
                  verification.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <ApprovalRuleBuilder steps={data.steps} />
        </Reveal>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <Reveal key={metric.label}>
            <Card className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                {metric.label}
              </p>
              <p className="mt-4 font-display text-[2.6rem] font-black tracking-[-0.05em] text-ink-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm font-medium text-ink-600">{metric.note}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageTransition>
  )
}
