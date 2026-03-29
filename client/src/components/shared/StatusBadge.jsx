import { Badge } from '../ui/badge.jsx'

const variantByStatus = {
  Draft: 'muted',
  Submitted: 'aqua',
  Approved: 'success',
  Paid: 'success',
  Refused: 'danger',
  'Pending Payment': 'aqua',
  Processing: 'default',
  'Live Integration': 'amber',
  Active: 'aqua',
  Review: 'amber',
}

export function StatusBadge({ status }) {
  return <Badge variant={variantByStatus[status] ?? 'default'}>{status}</Badge>
}
