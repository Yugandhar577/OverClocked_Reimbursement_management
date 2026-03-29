import { useAuthStore } from '../stores/useAuthStore.js'

const barHeights = ['h-10', 'h-14', 'h-20', 'h-24', 'h-28', 'h-32', 'h-36', 'h-40', 'h-44']
const widthClasses = ['w-[18%]', 'w-[28%]', 'w-[36%]', 'w-[46%]', 'w-[58%]', 'w-[72%]', 'w-[88%]']
const categoryDots = ['bg-brand-700', 'bg-aqua-600', 'bg-amber-500', 'bg-ink-400']
const usageTones = ['bg-aqua-500', 'bg-brand-500', 'bg-amber-500', 'bg-ink-400']

export function getCompanyCurrency() {
  return useAuthStore.getState().company?.baseCurrency ?? 'USD'
}

export function formatMoney(value, currency = getCompanyCurrency()) {
  const amount = Number(value ?? 0)

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatCompactCount(value) {
  return new Intl.NumberFormat('en-US').format(Number(value ?? 0))
}

export function formatShortDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatMonthLabel(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(new Date(value))
}

export function formatMonthGroup(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatRelativeTime(value) {
  if (!value) {
    return 'Just now'
  }

  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000))

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getInitials(...parts) {
  const label = parts.filter(Boolean).join(' ').trim()

  if (!label) {
    return 'NA'
  }

  return label
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function humanizeEnum(value) {
  if (!value) {
    return 'Unknown'
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function toUiRole(value) {
  if (value === 'MANAGER') {
    return 'Manager'
  }

  if (value === 'EMPLOYEE') {
    return 'User'
  }

  return 'Admin'
}

export function toUiExpenseStatus(expense) {
  if (expense.paymentStatus === 'PAID') {
    return 'Paid'
  }

  switch (expense.status) {
    case 'DRAFT':
      return 'Draft'
    case 'TO_SUBMIT':
      return 'Draft'
    case 'SUBMITTED':
      return 'Submitted'
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Refused'
    case 'DONE':
      return 'Paid'
    default:
      return humanizeEnum(expense.status)
  }
}

export function toPaymentStatusLabel(expense) {
  if (expense.paymentStatus === 'PAID') {
    return 'Paid'
  }

  if (expense.paymentStatus === 'IN_PAYMENT') {
    return 'Processing'
  }

  if (expense.status === 'APPROVED') {
    return 'Pending Payment'
  }

  return 'Live Integration'
}

export function getHeightClass(value, maxValue) {
  if (maxValue <= 0) {
    return barHeights[0]
  }

  const ratio = Math.min(1, Number(value ?? 0) / maxValue)
  const index = Math.min(barHeights.length - 1, Math.max(0, Math.round(ratio * (barHeights.length - 1))))
  return barHeights[index]
}

export function getWidthClass(value, maxValue) {
  if (maxValue <= 0) {
    return widthClasses[0]
  }

  const ratio = Math.min(1, Number(value ?? 0) / maxValue)
  const index = Math.min(widthClasses.length - 1, Math.max(0, Math.round(ratio * (widthClasses.length - 1))))
  return widthClasses[index]
}

export function getCategoryDot(index) {
  return categoryDots[index % categoryDots.length]
}

export function getUsageTone(index) {
  return usageTones[index % usageTones.length]
}

export function average(numbers) {
  if (!numbers.length) {
    return 0
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
}

export function sumBy(items, getter) {
  return items.reduce((sum, item) => sum + Number(getter(item) ?? 0), 0)
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
