import { GripVertical } from 'lucide-react'
import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Badge } from '../ui/badge.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'

export function ApprovalRuleBuilder({ steps }) {
  return (
    <Card className="p-6">
      <CardHeader className="mb-6 flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Approval Flow Steps</CardTitle>
          <CardDescription>
            Review the verification sequence for corporate travel and exception spend.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="relative space-y-5 before:absolute before:bottom-8 before:left-[1.35rem] before:top-8 before:w-px before:bg-brand-100">
        {steps.map((step) => (
          <div key={step.order} className="relative flex gap-4">
            <div className="relative z-[1] flex h-11 w-11 flex-none items-center justify-center rounded-md bg-white text-sm font-black text-brand-900 shadow-soft ring-1 ring-brand-100">
              {step.order}
            </div>
            <div className="min-w-0 flex-1 rounded-md border border-line bg-[#fffdfd] p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink-950">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-600">{step.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {step.required ? <Badge variant="amber">Required</Badge> : null}
                  <div className="rounded-xl p-2 text-ink-400">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {step.approvers.map((approver, index) => (
                  <div
                    key={approver}
                    className="flex items-center gap-3 rounded-md bg-[#f6f7f9] px-3 py-2"
                  >
                    <AvatarBadge
                      className="h-8 w-8 rounded-xl text-[10px]"
                      initials={approver
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                      toneClass={
                        index % 2 === 0
                          ? 'bg-brand-100 text-brand-900'
                          : 'bg-aqua-100 text-aqua-700'
                      }
                    />
                    <span className="text-sm font-semibold text-ink-800">{approver}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
