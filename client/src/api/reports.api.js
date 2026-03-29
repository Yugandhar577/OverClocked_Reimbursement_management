import { listExpenses } from './expenses.api.js'
import {
  formatMoney,
  formatMonthGroup,
  formatShortDate,
  getInitials,
  toUiExpenseStatus,
} from './transformers.js'

function groupByMonth(expenses) {
  const groups = new Map()

  expenses.forEach((expense) => {
    const key = formatMonthGroup(expense.expenseDate)
    const current = groups.get(key) ?? []
    current.push(expense)
    groups.set(key, current)
  })

  return Array.from(groups.entries()).map(([month, rows]) => ({
    month,
    rows,
  }))
}

export async function getExpenseReports() {
  const { items } = await listExpenses()
  const grouped = groupByMonth(items).sort(
    (left, right) => new Date(right.rows[0]?.expenseDate ?? 0) - new Date(left.rows[0]?.expenseDate ?? 0),
  )

  const toSubmit = items.filter(
    (expense) => expense.status === 'DRAFT' || expense.status === 'TO_SUBMIT',
  )
  const underValidation = items.filter((expense) => expense.status === 'SUBMITTED')
  const toReimburse = items.filter(
    (expense) =>
      expense.status === 'APPROVED' ||
      expense.paymentStatus === 'IN_PAYMENT' ||
      expense.paymentStatus === 'UNPAID',
  )

  return {
    statusFilters: [
      { label: 'All Reports', checked: true },
      { label: 'Draft', checked: false },
      { label: 'Submitted', checked: false },
      { label: 'Approved', checked: false },
    ],
    employees: [
      { label: 'Me', initials: 'ME' },
      { label: 'My Team', initials: 'MT' },
      { label: 'Everyone', initials: 'EV', active: true },
    ],
    totals: [
      {
        label: 'To Submit',
        value: formatMoney(
          toSubmit.reduce(
            (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
            0,
          ),
        ),
        reports: `${toSubmit.length} reports`,
        tone: 'brand',
      },
      {
        label: 'Under Validation',
        value: formatMoney(
          underValidation.reduce(
            (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
            0,
          ),
        ),
        reports: `${underValidation.length} reports`,
        tone: 'aqua',
      },
      {
        label: 'To Be Reimbursed',
        value: formatMoney(
          toReimburse.reduce(
            (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
            0,
          ),
        ),
        reports: `${toReimburse.length} reports`,
        tone: 'amber',
      },
    ],
    monthGroups:
      grouped.length > 0
        ? grouped.map((group, index) => ({
            month: group.month,
            count: `${group.rows.length} reports`,
            open: index === 0,
            rows: group.rows.map((expense) => ({
              id: expense.id,
              report: expense.title,
              employee: `${expense.creator.firstName} ${expense.creator.lastName}`.trim(),
              initials: getInitials(expense.creator.firstName, expense.creator.lastName),
              dateRange: formatShortDate(expense.expenseDate),
              total: formatMoney(expense.convertedAmount ?? expense.totalAmount, expense.currency),
              status: toUiExpenseStatus(expense),
            })),
          }))
        : [
            {
              month: formatMonthGroup(new Date()),
              count: '0 reports',
              open: true,
              rows: [],
            },
          ],
  }
}
