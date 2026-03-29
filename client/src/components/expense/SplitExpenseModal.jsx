import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'

function buildRows(line) {
  const total = Number(line?.amount ?? 0)
  const half = Number((total / 2).toFixed(2))

  return [
    {
      id: 'a',
      description: line?.description ?? 'Expense line',
      product: line?.category?.name ?? line?.description ?? 'Expense',
      amount: half,
      taxAmount: 0,
      employee: 'Current employee',
      customer: '-',
    },
    {
      id: 'b',
      description: line?.description ?? 'Expense line',
      product: line?.category?.name ?? line?.description ?? 'Expense',
      amount: Number((total - half).toFixed(2)),
      taxAmount: 0,
      employee: 'Current employee',
      customer: '-',
    },
  ]
}

export function SplitExpenseModal({ isOpen, line, onClose, onSplit }) {
  const [rows, setRows] = useState(() => buildRows(line))

  useEffect(() => {
    if (line) {
      setRows(buildRows(line))
    }
  }, [line])

  const originalAmount = Number(line?.amount ?? 0)
  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows],
  )

  const updateRow = (rowId, field, value) => {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: field === 'amount' ? Number(value || 0) : value,
            }
          : row,
      ),
    )
  }

  const handleBalancedAmount = (value) => {
    const first = Number(value || 0)
    const second = Number((originalAmount - first).toFixed(2))

    setRows((current) =>
      current.map((row) =>
        row.id === 'a'
          ? { ...row, amount: first }
          : row.id === 'b'
            ? { ...row, amount: second }
            : row,
      ),
    )
  }

  const handleSplit = () => {
    if (!line || rows.some((row) => row.amount <= 0) || totalAmount !== originalAmount) {
      return
    }

    onSplit(
      rows.map((row, index) => ({
        ...line,
        id: index === 0 ? line.id : undefined,
        description: row.description,
        amount: row.amount,
      })),
    )
  }

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-[980px] rounded-md border border-line bg-white p-0">
        <DialogHeader className="flex-row items-center justify-between border-b border-line px-5 py-4">
          <DialogTitle className="text-[1.9rem] font-semibold tracking-[-0.03em] text-ink-950">
            Expense split
          </DialogTitle>
          <button className="text-ink-500" onClick={onClose} type="button">
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>

        <div className="px-5 py-4">
          <table className="odoo-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Product</th>
                <th>Total In Currency</th>
                <th>Tax</th>
                <th>Tax amount</th>
                <th>Employee</th>
                <th>Customer to Reinvoice</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Input
                      className="h-9 rounded-md border-line shadow-none"
                      onChange={(event) => updateRow(row.id, 'description', event.target.value)}
                      value={row.description}
                    />
                  </td>
                  <td className="text-ink-700">{row.product}</td>
                  <td>
                    {row.id === 'a' ? (
                      <Input
                        className="h-9 rounded-md border-line shadow-none"
                        onChange={(event) => handleBalancedAmount(event.target.value)}
                        type="number"
                        value={row.amount}
                      />
                    ) : (
                      <Input
                        className="h-9 rounded-md border-line shadow-none"
                        onChange={(event) => updateRow(row.id, 'amount', event.target.value)}
                        type="number"
                        value={row.amount}
                      />
                    )}
                  </td>
                  <td>$</td>
                  <td>${Number(row.taxAmount).toFixed(2)}</td>
                  <td>{row.employee}</td>
                  <td>{row.customer}</td>
                  <td className="text-ink-400">-</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-[260px] space-y-3 text-right text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-ink-600">Total Amount:</span>
                <span className="font-semibold text-ink-950">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-ink-600">Original Amount:</span>
                <span className="font-semibold text-ink-950">${originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-ink-600">Taxes:</span>
                <span className="font-semibold text-ink-950">$0.00</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-start gap-2 border-t border-line px-5 py-4">
          <Button className="!h-10 !rounded-md !px-4" onClick={handleSplit}>
            Split Expense
          </Button>
          <Button className="!h-10 !rounded-md !px-4" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
