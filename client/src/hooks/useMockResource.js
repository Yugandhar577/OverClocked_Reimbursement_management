import { useEffect, useState } from 'react'

export function useMockResource(loader, dependencies = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    loader()
      .then((result) => {
        if (cancelled) {
          return
        }

        setData(result)
        setIsLoading(false)
      })
      .catch((nextError) => {
        if (cancelled) {
          return
        }

        setError(nextError)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, dependencies)

  return { data, error, isLoading }
}
