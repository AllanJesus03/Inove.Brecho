import { useState } from 'react'
import useProducts from '../../hooks/useProducts'
import ProductCard from '../ProductCard/ProductCard'
import { CATEGORIES } from '../../data/catalog'
import './Catalog.css'

export default function Catalog() {
  const { products, loading, error } = useProducts()
  const [activeCategory, setActiveCategory] = useState('')

  const available = products.filter((p) => p.status === 'disponivel')
  const filtered = activeCategory
    ? available.filter((p) => p.category === activeCategory)
    : available

  const sorted = [...filtered].sort((a, b) => {
    const aSale = a.salePrice != null ? 0 : 1
    const bSale = b.salePrice != null ? 0 : 1
    if (aSale !== bSale) return aSale - bSale
    return (b.createdAt || 0) - (a.createdAt || 0)
  })

  const counts = CATEGORIES.map((cat) => ({
    ...cat,
    count: available.filter((p) => p.category === cat.value).length
  })).filter((cat) => cat.count > 0)

  return (
    <section className="catalog">
      <div className="container">
        <div className="catalog-head" data-reveal>
          <h1 className="section-title left">
            Todos os <span>produtos</span>
          </h1>
          <p className="catalog-subtitle">
            {available.length} {available.length === 1 ? 'peça disponível' : 'peças disponíveis'}
          </p>
        </div>

        {counts.length > 1 && (
          <div className="catalog-chips" data-reveal>
            <button
              className={`catalog-chip${activeCategory === '' ? ' active' : ''}`}
              type="button"
              onClick={() => setActiveCategory('')}
            >
              Todas ({available.length})
            </button>
            {counts.map((cat) => (
              <button
                key={cat.value}
                className={`catalog-chip${activeCategory === cat.value ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {loading && <p className="catalog-status">Carregando produtos…</p>}

        {!loading && error && (
          <p className="catalog-status">Não foi possível carregar os produtos neste momento.</p>
        )}

        {!loading && !error && sorted.length === 0 && (
          <p className="catalog-status">Nenhuma peça nessa categoria por enquanto.</p>
        )}

        {!loading && sorted.length > 0 && (
          <div className="catalog-grid">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
