import { CircleDollarSign, Clock3, ReceiptText, Wallet } from 'lucide-react'
import { MetricCard } from '../shared/MetricCard.jsx'

const iconMap = {
  'Total Spend': CircleDollarSign,
  'Pending Approvals': ReceiptText,
  Reimbursed: Wallet,
  'Avg. Approval Time': Clock3,
}

export function AnalyticsCards({ cards }) {
  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          icon={iconMap[card.label]}
          label={card.label}
          note={card.note}
          tone={card.tone}
          trend={card.trend}
          value={card.value}
        />
      ))}
    </div>
  )
}
