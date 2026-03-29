import { getApprovalRulesWorkspace } from '../../api/approval-rules.api.js'
import { ApprovalRuleBuilder } from '../../components/admin/ApprovalRuleBuilder.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Switch } from '../../components/ui/switch.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function ApprovalRulesPage() {
  const { data, isLoading } = useMockResource(getApprovalRulesWorkspace, [])

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
          description="Review the workflow and thresholds used for corporate travel expenses without exposing unfinished edit controls."
          title="Executive Travel Policy"
        />
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_0.8fr_1.35fr]">
        <Reveal>
          <Card className="p-5">
            <CardHeader className="mb-6 flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Approval Rules</CardTitle>
                <CardDescription>Select a policy to edit.</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {data.rules.map((rule) => (
                <div
                  key={rule.name}
                  className={`w-full rounded-md border px-5 py-4 text-left ${
                    rule.active
                      ? 'border-brand-200 bg-white'
                      : 'border-transparent bg-[#faf6f7]'
                  }`}
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
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="p-5">
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
                  <Switch checked={control.enabled} disabled onCheckedChange={() => {}} />
                </div>
              ))}

              <div className="rounded-md bg-[#fbf8f8] p-5">
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
                  <span className="text-2xl font-semibold tracking-[-0.04em] text-brand-900">
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
            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                {metric.label}
              </p>
              <p className="mt-4 text-[2.3rem] font-semibold tracking-[-0.05em] text-ink-950">
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
