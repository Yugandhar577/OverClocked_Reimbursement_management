import { useMemo } from 'react'
import { useAuthStore } from '../stores/useAuthStore.js'

export function useCurrency(selectedCurrency) {
  const baseCurrency = useAuthStore((state) => state.company?.baseCurrency ?? 'USD')

  return useMemo(
    () => ({
      baseCurrency,
      currency: selectedCurrency ?? baseCurrency,
      format(value, overrideCurrency) {
        const currency = overrideCurrency ?? selectedCurrency ?? baseCurrency
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
      },
    }),
    [baseCurrency, selectedCurrency],
  )
}
