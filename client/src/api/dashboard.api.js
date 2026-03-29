import { getNotifications } from './notifications.api.js'
import { listExpenses } from './expenses.api.js'
import { listUsers } from './users.api.js'
import {
  average,
  formatMoney,
  formatMonthLabel,
  formatRelativeTime,
  getCategoryDot,
  getHeightClass,
  getInitials,
  getWidthClass,
  sumBy,
} from './transformers.js'

function getMonthBuckets() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  return Array.from({ length: 7 }, (_, index) =>
    new Date(currentYear, currentMonth - (6 - index), 1),
  )
}

export async function getDashboardSummary() {
  const [{ items: expenses }, { items: notifications }, { items: users }] = await Promise.all([
    listExpenses(),
    getNotifications({ limit: 3 }),
    listUsers(),
  ])

  const usersById = new Map(users.map((user) => [user.id, user]))
  const totalSpend = sumBy(expenses, (expense) => expense.convertedAmount ?? expense.totalAmount)
  const pendingApprovals = expenses.filter((expense) => expense.status === 'SUBMITTED')
  const reimbursed = expenses.filter(
    (expense) => expense.paymentStatus === 'PAID' || expense.status === 'DONE',
  )
  const approvalDurations = expenses
    .filter((expense) => expense.submittedAt && expense.approvedAt)
    .map(
      (expense) =>
        (new Date(expense.approvedAt).getTime() - new Date(expense.submittedAt).getTime()) /
        (1000 * 60 * 60 * 24),
    )

  const monthBuckets = getMonthBuckets()
  const currentValues = monthBuckets.map((bucket) =>
    sumBy(
      expenses.filter((expense) => {
        const expenseDate = new Date(expense.expenseDate)
        return (
          expenseDate.getFullYear() === bucket.getFullYear() &&
          expenseDate.getMonth() === bucket.getMonth()
        )
      }),
      (expense) => expense.convertedAmount ?? expense.totalAmount,
    ),
  )

  const maxTrend = Math.max(...currentValues, 1)
  const categoryTotals = new Map()
  expenses.forEach((expense) => {
    const label = expense.category?.name ?? 'Uncategorized'
    categoryTotals.set(label, (categoryTotals.get(label) ?? 0) + Number(expense.convertedAmount ?? expense.totalAmount ?? 0))
  })

  const topCategories = Array.from(categoryTotals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)

  const departmentTotals = new Map()
  expenses.forEach((expense) => {
    const creator = usersById.get(expense.creator.id)
    const label = creator?.department?.name ?? 'Operations'
    departmentTotals.set(label, (departmentTotals.get(label) ?? 0) + Number(expense.convertedAmount ?? expense.totalAmount ?? 0))
  })

  const rankedDepartments = Array.from(departmentTotals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
  const maxDepartment = Math.max(...rankedDepartments.map((entry) => entry[1]), 1)
  const liveKpis = [
    {
      label: 'Total Spend',
      value: formatMoney(totalSpend),
      trend: `${expenses.length} claims`,
      note: 'All tracked company expenses',
      tone: 'aqua',
    },
    {
      label: 'Pending Approvals',
      value: String(pendingApprovals.length),
      trend: pendingApprovals.length ? 'Alert' : 'Clear',
      note: 'Items waiting on approvers',
      tone: 'amber',
    },
    {
      label: 'Reimbursed',
      value: formatMoney(
        sumBy(reimbursed, (expense) => expense.convertedAmount ?? expense.totalAmount),
      ),
      trend: `${reimbursed.length} settled`,
      note: 'Paid or completed reimbursements',
      tone: 'aqua',
    },
    {
      label: 'Avg. Approval Time',
      value: `${average(approvalDurations).toFixed(1)} days`,
      trend: `${users.length} users`,
      note: 'Based on approved expenses',
      tone: 'neutral',
    },
  ]
  const liveTrend = monthBuckets.map((bucket, index) => ({
    id: `${bucket.getFullYear()}-${bucket.getMonth()}`,
    month: formatMonthLabel(bucket),
    previousHeight: getHeightClass(currentValues[index - 1] ?? 0, maxTrend),
    currentHeight: getHeightClass(currentValues[index], maxTrend),
  }))
  const liveCategoryBreakdown = topCategories.map(([label, amount], index) => ({
    label,
    share: totalSpend ? `${Math.round((amount / totalSpend) * 100)}%` : '0%',
    dot: getCategoryDot(index),
  }))
  const liveDepartments = rankedDepartments.map(([name, amount]) => ({
    name,
    amount: formatMoney(amount),
    widthClass: getWidthClass(amount, maxDepartment),
  }))
  const liveActivity = notifications.map((notification, index) => ({
    actor: notification.title,
    action: 'updated',
    subject: notification.message,
    amount: notification.type.replaceAll('_', ' '),
    toneClass:
      index % 3 === 0
        ? 'bg-brand-100 text-brand-950'
        : index % 3 === 1
          ? 'bg-aqua-100 text-aqua-700'
          : 'bg-amber-100 text-amber-700',
    time: formatRelativeTime(notification.createdAt),
    initials: getInitials(notification.title),
  }))

  return {
    kpis: liveKpis,
    trend: liveTrend,
    categoryBreakdown: liveCategoryBreakdown,
    departments: liveDepartments,
    activity: liveActivity,
  }
}
