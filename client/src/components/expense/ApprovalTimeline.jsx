import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { formatRelativeTime } from '../../api/transformers.js'

function resolveTone(action) {
  switch (action) {
    case 'APPROVED':
      return {
        icon: CheckCircle2,
        iconClass: 'text-[#2f8f68]',
        badgeClass: 'bg-[#e4f5ea] text-[#2f8f68]',
        label: 'Approved',
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        iconClass: 'text-[#c4495a]',
        badgeClass: 'bg-[#ffe1e6] text-[#c4495a]',
        label: 'Rejected',
      }
    default:
      return {
        icon: Clock3,
        iconClass: 'text-[#7a7f87]',
        badgeClass: 'bg-[#eef2f6] text-[#58626f]',
        label: 'Pending',
      }
  }
}

export function ApprovalTimeline({ steps = [] }) {
  return (
    <section className="odoo-panel overflow-hidden">
      <div className="border-b border-line px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
          Approval Timeline
        </p>
      </div>

      <div className="divide-y divide-line">
        {steps.length ? (
          steps.map((step, index) => {
            const tone = resolveTone(step.action)
            const Icon = tone.icon

            return (
              <div
                key={step.id ?? `${step.approverId}-${index}`}
                className="grid gap-4 px-6 py-5 md:grid-cols-[84px_minmax(0,1fr)_auto]"
              >
                <div className="text-sm font-medium text-ink-500">
                  Step {step.sequence ?? index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f7fa]">
                      <Icon className={`h-4 w-4 ${tone.iconClass}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-950">
                        {step.approver?.firstName} {step.approver?.lastName}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">
                        {step.comment || 'Awaiting reviewer note.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
                  <span className={`odoo-status-pill ${tone.badgeClass}`}>{tone.label}</span>
                  <span className="text-xs text-ink-500">
                    {formatRelativeTime(step.updatedAt ?? step.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-6 py-6 text-sm text-ink-600">
            Approval steps will appear after the claim is submitted.
          </div>
        )}
      </div>
    </section>
  )
}
