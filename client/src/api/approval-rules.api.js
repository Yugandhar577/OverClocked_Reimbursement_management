import { api } from './http.js'
import { average, humanizeEnum } from './transformers.js'

function normalizeRulePayload(payload) {
  const normalized = {
    ...payload,
  }

  if (payload.approvers !== undefined) {
    normalized.approvers = payload.approvers.map((approver, index) => ({
      userId: approver.userId,
      sequence: Number(approver.sequence ?? index + 1),
      isRequired: Boolean(approver.isRequired),
    }))
  }

  if (payload.percentageRequired !== undefined) {
    normalized.percentageRequired =
      payload.percentageRequired === null
        ? null
        : Number(payload.percentageRequired)
  }

  if (payload.priority !== undefined) {
    normalized.priority = Number(payload.priority)
  }

  return normalized
}

export async function listApprovalRules(params = {}) {
  const response = await api.get('/api/approval-rules', {
    params,
  })

  return response.data.data ?? []
}

export async function createApprovalRule(payload) {
  const response = await api.post('/api/approval-rules', normalizeRulePayload(payload))
  return response.data.data
}

export async function updateApprovalRule(ruleId, payload) {
  const response = await api.put(`/api/approval-rules/${ruleId}`, normalizeRulePayload(payload))
  return response.data.data
}

export async function deactivateApprovalRule(ruleId) {
  const response = await api.delete(`/api/approval-rules/${ruleId}`)
  return response.data.data
}

export async function getApprovalRulesWorkspace() {
  const rules = await listApprovalRules()
  const primaryRule = rules[0] ?? null
  const approverCounts = rules.map((rule) => rule.approvers?.length ?? 0)
  const liveRules = rules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    description: rule.description ?? 'Rule is ready for enterprise review routing.',
    active: rule.isActive,
    version: `v${rule.approvers?.length ?? 0}.${(rule.priority ?? 0) + 1}`,
  }))
  const liveSteps =
    primaryRule?.approvers?.map((approver) => ({
      order: approver.sequence,
      title: `Approval Step ${approver.sequence}`,
      description: humanizeEnum(approver.user.role),
      approvers: [`${approver.user.firstName} ${approver.user.lastName}`.trim()],
      required: approver.isRequired,
    })) ?? []
  const liveMetrics = [
    {
      label: 'Active Users',
      value: String(rules.filter((rule) => rule.isActive).length),
      note: 'Active approval policies',
    },
    {
      label: 'Avg Time',
      value: `${average(approverCounts).toFixed(1)} steps`,
      note: 'Average approver depth',
    },
    {
      label: 'Rejections',
      value: `${rules.filter((rule) => !rule.isActive).length}%`,
      note: 'Inactive or retired rules',
    },
    {
      label: 'Last Modified',
      value: primaryRule
        ? new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }).format(new Date(primaryRule.updatedAt))
        : 'No rules',
      note: primaryRule ? 'Most recently updated policy' : 'Create your first rule',
    },
  ]
  return {
    rules: liveRules,
    controls: [
      {
        label: 'VIP Exclusive Rule',
        enabled:
          primaryRule?.approvers?.some((approver) => approver.user.isVipApprover) ?? false,
      },
      {
        label: 'Require Receipt Scan',
        enabled: true,
      },
      {
        label: 'Notify Submitter',
        enabled: true,
      },
    ],
    threshold:
      primaryRule?.percentageRequired
        ? `${primaryRule.percentageRequired}%`
        : 'N/A',
    steps: liveSteps,
    metrics: liveMetrics,
  }
}
