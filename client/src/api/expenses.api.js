import { api } from './http.js'
import {
  formatMoney,
  formatShortDate,
  getInitials,
  toUiExpenseStatus,
} from './transformers.js'

function buildEmployeeFilters(expenses) {
  const counter = new Map()

  expenses.forEach((expense) => {
    const label = `${expense.creator.firstName} ${expense.creator.lastName}`.trim()
    const current = counter.get(label) ?? {
      label,
      initials: getInitials(expense.creator.firstName, expense.creator.lastName),
      count: 0,
    }

    current.count += 1
    counter.set(label, current)
  })

  return Array.from(counter.values())
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
    .map((item, index) => ({
      ...item,
      active: index === 0,
    }))
}

export async function listExpenses(params = {}) {
  const response = await api.get('/api/expenses', {
    params: {
      limit: 100,
      sortBy: 'expenseDate',
      sortOrder: 'desc',
      ...params,
    },
  })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
  }
}

export async function getAllExpenses() {
  const { items, pagination } = await listExpenses()
  const categories = [...new Set(items.map((expense) => expense.category?.name).filter(Boolean))]
  const submittedExpenses = items.filter(
    (expense) => expense.status === 'SUBMITTED' || expense.status === 'APPROVED',
  )

  const categorySpend = new Map()
  items.forEach((expense) => {
    const label = expense.category?.name ?? 'Uncategorized'
    categorySpend.set(label, (categorySpend.get(label) ?? 0) + Number(expense.totalAmount ?? 0))
  })

  const topCategory = Array.from(categorySpend.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0]

  const employeeExpenseCounts = buildEmployeeFilters(items)

  return {
    statusFilters: [
      { label: 'Draft', checked: false },
      { label: 'Submitted', checked: true },
      { label: 'Approved', checked: false },
      { label: 'Paid', checked: false },
      { label: 'Refused', checked: false },
    ],
    employees: employeeExpenseCounts,
    categories,
    rows: items.map((expense) => ({
      id: expense.id,
      date: formatShortDate(expense.expenseDate),
      employee: `${expense.creator.firstName} ${expense.creator.lastName}`.trim(),
      initials: getInitials(expense.creator.firstName, expense.creator.lastName),
      category: expense.category?.name ?? 'Uncategorized',
      description: expense.description || expense.title,
      amount: formatMoney(expense.convertedAmount ?? expense.totalAmount, expense.currency),
      status: toUiExpenseStatus(expense),
    })),
    highlights: [
      {
        label: 'Total Pending',
        value: formatMoney(
          submittedExpenses.reduce(
            (sum, expense) => sum + Number(expense.convertedAmount ?? expense.totalAmount ?? 0),
            0,
          ),
        ),
        note: `${submittedExpenses.length} items waiting for action`,
        tone: 'danger',
      },
      {
        label: 'Top Category',
        value: topCategory?.[0] ?? 'None Yet',
        note: topCategory ? `${formatMoney(topCategory[1])} in submitted spend` : 'No category spend yet',
        tone: 'brand',
      },
      {
        label: 'Employee Insights',
        value:
          employeeExpenseCounts[0]
            ? `${employeeExpenseCounts[0].label} submitted ${employeeExpenseCounts[0].count} claims in the current list.`
            : 'No employee claims are available yet.',
        note: 'Use the sidebar filters to narrow by employee or status.',
        tone: 'soft',
      },
    ],
    pagination,
  }
}
