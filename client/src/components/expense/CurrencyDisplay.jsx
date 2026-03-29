import { useCurrency } from '../../hooks/useCurrency.js'

export function CurrencyDisplay({ amount, currency, className = '' }) {
  const { format } = useCurrency(currency)

  return <span className={className}>{format(amount, currency)}</span>
}
