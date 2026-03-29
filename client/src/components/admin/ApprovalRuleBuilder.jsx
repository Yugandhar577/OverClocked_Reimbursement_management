import { GripVertical, Plus } from 'lucide-react'
import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Badge } from '../ui/badge.jsx'
import { Button } from '../ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'

export function ApprovalRuleBuilder({ steps }) {
  return (
    <Card className="p-6">
      <CardHeader className="mb-6 flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Approval Flow Steps</CardTitle>
          <CardDescription>
            Define the verification sequence for corporate travel and exception
            spend.
          </CardDescription>
        </div>
        <Button size="sm" variant="subtle">
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </CardHeader>

      <div className="relative space-y-5 before:absolute before:bottom-8 before:left-[1.35rem] before:top-8 before:w-px before:bg-brand-100">
        {steps.map((step) => (
          <div key={step.order} className="relative flex gap-4">
            <div className="relative z-[1] flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white text-sm font-black text-brand-900 shadow-soft ring-1 ring-brand-100">
              {step.order}
            </div>
            <div className="min-w-0 flex-1 rounded-[24px] border border-line bg-[#fffdfd] p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="font-display text-xl font-bold tracking-[-0.03em] text-ink-950">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-600">{step.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {step.required ? <Badge variant="amber">Required</Badge> : null}
                  <button
                    className="rounded-xl p-2 text-ink-400 transition hover:bg-brand-50 hover:text-brand-800"
                    type="button"
                  >
                    <GripVertical className="h-4 w-4" />
                    <span className="sr-only">Reorder step</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {step.approvers.map((approver, index) => (
                  <div
                    key={approver}
                    className="flex items-center gap-3 rounded-2xl bg-[#f8f3f4] px-3 py-2"
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
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-brand-200 text-brand-600 transition hover:bg-brand-50"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add approver</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
