import { useEffect, useState } from 'react'
import defaultProducts from '../data/products'

export default function useProducts() {
  const [products, setProducts] = useState(defaultProducts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar produtos')
        return res.json()
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setProducts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading, error }
}