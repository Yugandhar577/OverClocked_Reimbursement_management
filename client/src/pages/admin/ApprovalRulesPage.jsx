import { Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  createApprovalRule,
  deactivateApprovalRule,
  listApprovalRules,
  updateApprovalRule,
} from '../../api/approval-rules.api.js'
import { ApprovalRuleBuilder } from '../../components/admin/ApprovalRuleBuilder.jsx'
import { ConfigurationTabs } from '../../components/shared/ConfigurationTabs.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Switch } from '../../components/ui/switch.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'
import { humanizeEnum } from '../../api/transformers.js'

function toApproverPayload(approvers = []) {
  return approvers.map((approver, index) => ({
    userId: approver.userId ?? approver.user?.id,
    sequence: Number(approver.sequence ?? index + 1),
    isRequired: Boolean(approver.isRequired),
  }))
}

function toDraft(rule) {
  return {
    name: rule?.name ?? '',
    description: rule?.description ?? '',
    percentageRequired:
      rule?.percentageRequired === null || rule?.percentageRequired === undefined
        ? 100
        : Number(rule.percentageRequired),
    priority: Number(rule?.priority ?? 0),
  }
}

export function ApprovalRulesPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeRuleId, setActiveRuleId] = useState('')
  const [draft, setDraft] = useState({
    name: '',
    description: '',
    percentageRequired: 100,
    priority: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { data, isLoading } = useMockResource(() => listApprovalRules(), [refreshKey])

  const rules = data ?? []
  const selectedRule = rules.find((rule) => rule.id === activeRuleId) ?? rules[0] ?? null

  useEffect(() => {
    if (!selectedRule) {
      setActiveRuleId('')
      setDraft({
        name: '',
        description: '',
        percentageRequired: 100,
        priority: 0,
      })
      return
    }

    if (!activeRuleId) {
      setActiveRuleId(selectedRule.id)
    }

    setDraft(toDraft(selectedRule))
  }, [activeRuleId, selectedRule])

  if (isLoading && !data) {
    return <LoadingPanel />
  }

  const controls = [
    {
      label: 'VIP Exclusive Rule',
      enabled: selectedRule?.approvers?.some((approver) => approver.user?.isVipApprover) ?? false,
    },
    {
      label: 'Require Receipt Scan',
      enabled: true,
    },
    {
      label: 'Notify Submitter',
      enabled: true,
    },
  ]

  const steps = (selectedRule?.approvers ?? []).map((approver) => ({
    order: approver.sequence,
    title: `Approval Step ${approver.sequence}`,
    description: humanizeEnum(approver.user?.role),
    approvers: [`${approver.user?.firstName ?? ''} ${approver.user?.lastName ?? ''}`.trim()],
    required: approver.isRequired,
  }))

  const approverCounts = rules.map((rule) => rule.approvers?.length ?? 0)
  const avgApproverDepth = approverCounts.length
    ? approverCounts.reduce((sum, value) => sum + value, 0) / approverCounts.length
    : 0

  const metrics = [
    {
      label: 'Active Rules',
      value: String(rules.filter((rule) => rule.isActive).length),
      note: 'Policies currently enforcing approvals',
    },
    {
      label: 'Avg Time',
      value: `${avgApproverDepth.toFixed(1)} steps`,
      note: 'Average approver depth',
    },
    {
      label: 'Inactive Rules',
      value: String(rules.filter((rule) => !rule.isActive).length),
      note: 'Retired or disabled policies',
    },
    {
      label: 'Last Modified',
      value: selectedRule
        ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }).format(new Date(selectedRule.updatedAt))
        : 'No rules',
      note: selectedRule ? 'Most recently selected policy' : 'Create your first rule',
    },
  ]

  const isPercentageRule = selectedRule?.approvalType === 'PERCENTAGE'

  const resetDraft = () => {
    if (selectedRule) {
      setDraft(toDraft(selectedRule))
    }
  }

  const handleSave = async () => {
    if (!selectedRule) {
      return
    }

    setError('')
    setMessage('')
    setIsSaving(true)

    try {
      await updateApprovalRule(selectedRule.id, {
        name: draft.name.trim() || selectedRule.name,
        description: draft.description || null,
        approvalType: selectedRule.approvalType,
        percentageRequired: isPercentageRule ? Number(draft.percentageRequired) : null,
        priority: Number(draft.priority ?? 0),
        approvers: toApproverPayload(selectedRule.approvers),
      })

      setMessage('Approval rule saved successfully.')
      setRefreshKey((value) => value + 1)
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ??
          saveError?.message ??
          'Unable to save the selected rule.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!selectedRule || !selectedRule.approvers?.length) {
      setError('Select a rule with at least one approver before creating a copy.')
      return
    }

    setError('')
    setMessage('')
    setIsSaving(true)

    try {
      const created = await createApprovalRule({
        name: `${draft.name.trim() || selectedRule.name} Copy`,
        description: draft.description || selectedRule.description || null,
        departmentId: selectedRule.departmentId ?? null,
        approvalType: selectedRule.approvalType,
        percentageRequired: isPercentageRule
          ? Number(draft.percentageRequired)
          : selectedRule.percentageRequired,
        minAmount: selectedRule.minAmount ?? null,
        maxAmount: selectedRule.maxAmount ?? null,
        priority: Number(draft.priority ?? selectedRule.priority ?? 0),
        approvers: toApproverPayload(selectedRule.approvers),
      })

      setActiveRuleId(created.id)
      setMessage('New approval rule created from the selected policy.')
      setRefreshKey((value) => value + 1)
    } catch (createError) {
      setError(
        createError?.response?.data?.message ??
          createError?.message ??
          'Unable to create a new approval rule.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedRule) {
      return
    }

    setError('')
    setMessage('')
    setIsSaving(true)

    try {
      await deactivateApprovalRule(selectedRule.id)
      setMessage('Selected rule was deactivated successfully.')
      setRefreshKey((value) => value + 1)
    } catch (deactivateError) {
      setError(
        deactivateError?.response?.data?.message ??
          deactivateError?.message ??
          'Unable to deactivate this rule.',
      )
    } finally {
      setIsSaving(false)
    }
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
              <Button disabled={isSaving} onClick={resetDraft} size="sm" variant="secondary">
                <RefreshCcw className="h-4 w-4" />
                Discard
              </Button>
              {selectedRule?.isActive ? (
                <Button disabled={isSaving} onClick={handleDeactivate} size="sm" variant="danger">
                  <Trash2 className="h-4 w-4" />
                  Deactivate
                </Button>
              ) : null}
              <Button disabled={isSaving || !selectedRule} onClick={handleSave} size="sm">
                Save Rule
              </Button>
            </>
          }
          description="Define the workflow and thresholds for corporate travel expenses."
          title={selectedRule?.name ?? 'Approval Rules'}
        />
      </Reveal>

      {error ? (
        <div className="rounded-[22px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {message ? (
        <div className="rounded-[22px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">{message}</div>
      ) : null}

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
                onClick={handleCreate}
                type="button"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Create rule</span>
              </button>
            </CardHeader>

            <div className="space-y-4">
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                    rule.id === selectedRule?.id
                      ? 'border-brand-200 bg-white shadow-card'
                      : 'border-transparent bg-[#faf6f7] hover:border-brand-100'
                  }`}
                  onClick={() => {
                    setActiveRuleId(rule.id)
                    setError('')
                    setMessage('')
                  }}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-950">{rule.name}</p>
                      <p className="mt-2 text-sm leading-6 text-ink-600">
                        {rule.description}
                      </p>
                    </div>
                    {rule.isActive ? <Badge variant="aqua">Active</Badge> : null}
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                    v{rule.approvers?.length ?? 0}.{(rule.priority ?? 0) + 1}
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
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Rule Name
                </label>
                <Input
                  disabled={!selectedRule || isSaving}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Approval policy name"
                  value={draft.name}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Description
                </label>
                <textarea
                  className="min-h-24 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm text-ink-950 shadow-soft outline-none transition focus:border-brand-500"
                  disabled={!selectedRule || isSaving}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe when this rule should apply."
                  value={draft.description}
                />
              </div>

              {controls.map((control) => (
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

              <div className="rounded-[24px] bg-[#fbf8f8] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Threshold For Auto-Approval
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <input
                    className="h-2 w-full cursor-pointer accent-brand-700"
                    disabled={!selectedRule || !isPercentageRule || isSaving}
                    max="100"
                    min="1"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        percentageRequired: Number(event.target.value),
                      }))
                    }
                    type="range"
                    value={draft.percentageRequired}
                  />
                  <span className="font-display text-2xl font-black tracking-[-0.04em] text-brand-900">
                    {isPercentageRule ? `${draft.percentageRequired}%` : 'N/A'}
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
          <ApprovalRuleBuilder steps={steps} />
        </Reveal>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {metrics.map((metric) => (
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
