import { useEffect, useRef } from 'react'
import useProducts from '../../hooks/useProducts'
import ProductCard from '../ProductCard/ProductCard'

const AUTO_SCROLL_DELAY = 4500

export default function Produtos() {
  const { products, loading, error } = useProducts()
  const trackRef = useRef(null)
  const timerRef = useRef(null)

  const available = products
    .filter((product) => product.status === 'disponivel')
    .sort((a, b) => {
      const aSale = a.salePrice != null ? 0 : 1
      const bSale = b.salePrice != null ? 0 : 1
      if (aSale !== bSale) return aSale - bSale
      return (b.createdAt || 0) - (a.createdAt || 0)
    })

  const scrollByCard = (direction) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.carousel-card')
    const cardWidth = card ? card.getBoundingClientRect().width : 280
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track || !available.length) return undefined
    if (track.scrollWidth <= track.clientWidth) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const step = () => {
      const card = track.querySelector('.carousel-card')
      if (!card) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      const width = card.getBoundingClientRect().width + gap
      const maxScroll = track.scrollWidth - track.clientWidth
      if (track.scrollLeft >= maxScroll - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        track.scrollBy({ left: width, behavior: 'smooth' })
      }
    }

    const start = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(step, AUTO_SCROLL_DELAY)
    }
    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    start()
    track.addEventListener('mouseenter', stop)
    track.addEventListener('mouseleave', start)
    track.addEventListener('touchstart', stop, { passive: true })
    track.addEventListener('touchend', start)

    return () => {
      stop()
      track.removeEventListener('mouseenter', stop)
      track.removeEventListener('mouseleave', start)
      track.removeEventListener('touchstart', stop)
      track.removeEventListener('touchend', start)
    }
  }, [available.length])

  return (
    <section className="section products" id="produtos">
      <div className="container">
        <div className="products-head" data-reveal>
          <h2 className="section-title left">
            Destaques <span>do Inove</span>
          </h2>
          <div className="products-head-right">
            <div className="carousel-controls">
              <button
                className="carousel-btn"
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Produtos anteriores"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                className="carousel-btn"
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Próximos produtos"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <a className="products-more" href="#/produtos">
              Ver todos →
            </a>
          </div>
        </div>

        {loading && <p className="products-status">Carregando produtos…</p>}

        {!loading && error && (
          <p className="products-status">Não foi possível carregar os produtos neste momento.</p>
        )}

        {!loading && !error && available.length === 0 && (
          <p className="products-status">Em breve, novas peças.</p>
        )}

        {!loading && available.length > 0 && (
          <div className="carousel" ref={trackRef}>
            {available.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="carousel-card"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
