import { CheckCircle2, Clock3, XCircle } from 'lucide-react'

function resolveTone(action) {
  switch (action) {
    case 'APPROVED':
      return {
        icon: CheckCircle2,
        iconClass: 'text-aqua-600',
        badge: 'Approved',
      }
    case 'REJECTED':
      return {
        icon: XCircle,
        iconClass: 'text-red-600',
        badge: 'Rejected',
      }
    default:
      return {
        icon: Clock3,
        iconClass: 'text-amber-600',
        badge: 'Pending',
      }
  }
}

export function ApprovalTimeline({ steps = [] }) {
  return (
    <section className="surface-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Approval Timeline</p>

      <div className="mt-4 space-y-4">
        {steps.length ? (
          steps.map((step, index) => {
            const tone = resolveTone(step.action)
            const Icon = tone.icon

            return (
              <div key={step.id ?? `${step.approverId}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                    <Icon className={`h-5 w-5 ${tone.iconClass}`} />
                  </div>
                  {index < steps.length - 1 ? <div className="mt-2 h-full w-px bg-line" /> : null}
                </div>

                <div className="min-w-0 flex-1 rounded-[22px] bg-[#fbf7fa] px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-950">
                        {step.approver?.firstName} {step.approver?.lastName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-500">
                        Step {step.sequence ?? index + 1}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700 shadow-soft">
                      {tone.badge}
                    </span>
                  </div>
                  {step.comment ? (
                    <p className="mt-3 text-sm leading-6 text-ink-600">{step.comment}</p>
                  ) : null}
                </div>
              </div>
            )
          })
        ) : (
          <p className="rounded-[22px] bg-brand-50 px-4 py-4 text-sm leading-6 text-ink-700">
            Approval steps will appear after the claim is submitted.
          </p>
        )}
      </div>
    </section>
  )
}
