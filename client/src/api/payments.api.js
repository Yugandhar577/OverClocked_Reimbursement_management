import { listExpenses } from './expenses.api.js'
import { listUsers } from './users.api.js'
import { api } from './http.js'
import {
  formatMoney,
  formatShortDate,
  getInitials,
  toPaymentStatusLabel,
} from './transformers.js'

export async function getPaymentsQueue() {
  const [{ items: expenses }, { items: users }] = await Promise.all([
    listExpenses(),
    listUsers(),
  ])

  const usersById = new Map(users.map((user) => [user.id, user]))
  const paymentRows = expenses.filter(
    (expense) =>
      expense.status === 'APPROVED' ||
      expense.paymentStatus === 'IN_PAYMENT' ||
      expense.paymentStatus === 'PAID',
  )

  const pendingSettlement = paymentRows.filter((expense) => expense.paymentStatus !== 'PAID')
  const inProcessing = paymentRows.filter((expense) => expense.paymentStatus === 'IN_PAYMENT')
  const liveRows = paymentRows.map((expense) => {
    const creator = usersById.get(expense.creator.id) ?? null

    return {
      id: expense.id,
      employee: `${expense.creator.firstName} ${expense.creator.lastName}`.trim(),
      initials: getInitials(expense.creator.firstName, expense.creator.lastName),
      department: creator?.department?.name ?? 'Operations',
      category: expense.category?.name ?? 'Uncategorized',
      submitted: formatShortDate(expense.submittedAt ?? expense.expenseDate),
      amount: formatMoney(expense.convertedAmount ?? expense.totalAmount, expense.currency),
      status: toPaymentStatusLabel(expense),
      action: expense.paymentStatus === 'IN_PAYMENT' ? 'Locked' : 'Trigger',
    }
  })
  const liveStats = [
    {
      label: 'Pending Settlement',
      value: formatMoney(
        pendingSettlement.reduce(
          (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
          0,
        ),
      ),
      note: `${pendingSettlement.length} payouts waiting for completion`,
      tone: 'aqua',
    },
    {
      label: 'Queue Volume',
      value: `${paymentRows.length} Items`,
      note: `${inProcessing.length} currently processing`,
      tone: 'neutral',
    },
    {
      label: 'Settled This Cycle',
      value: formatMoney(
        paymentRows
          .filter((expense) => expense.paymentStatus === 'PAID')
          .reduce(
            (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
            0,
          ),
      ),
      note: 'Approved reimbursements already completed',
      tone: 'brand',
    },
  ]

  return {
    stats: liveStats,
    tabs: ['All', 'Pending', 'In Payment', 'Paid'],
    rows: liveRows,
  }
}

export async function createPaymentOrderRequest(expenseId) {
  const response = await api.post('/api/payments/order', { expenseId })
  return response.data.data
}

export async function verifyPaymentRequest(payload) {
  const response = await api.post('/api/payments/verify', payload)
  return response.data.data
}
