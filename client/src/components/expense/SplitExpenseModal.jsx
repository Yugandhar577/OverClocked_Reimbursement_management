import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'

export function SplitExpenseModal({ isOpen, line, onClose, onSplit }) {
  const [firstAmount, setFirstAmount] = useState('')

  useEffect(() => {
    if (line?.amount) {
      setFirstAmount((Number(line.amount) / 2).toFixed(2))
    }
  }, [line])

  const total = Number(line?.amount ?? 0)
  const first = Number(firstAmount || 0)
  const second = Number((total - first).toFixed(2))

  const handleSplit = () => {
    if (!line || first <= 0 || second <= 0) {
      return
    }

    onSplit([
      {
        ...line,
        description: `${line.description} - Part A`,
        amount: first,
      },
      {
        ...line,
        id: undefined,
        description: `${line.description} - Part B`,
        amount: second,
      },
    ])
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Split Expense</DialogTitle>
          <DialogDescription>
            Divide one line into two mobile-friendly sub-lines before saving the draft.
          </DialogDescription>
        </DialogHeader>

        {line ? (
          <div className="space-y-4">
            <div className="rounded-[22px] bg-brand-50 px-4 py-3">
              <p className="font-semibold text-ink-950">{line.description}</p>
              <p className="mt-1 text-sm text-ink-600">Original amount: {Number(line.amount).toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">
                First split amount
              </label>
              <Input onChange={(event) => setFirstAmount(event.target.value)} type="number" value={firstAmount} />
            </div>

            <div className="rounded-[22px] bg-aqua-50 px-4 py-3 text-sm leading-6 text-ink-700">
              The second line will be created automatically with the remaining amount: <strong>{second.toFixed(2)}</strong>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSplit}>Split line</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
