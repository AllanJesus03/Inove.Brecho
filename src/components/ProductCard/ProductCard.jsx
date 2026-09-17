import { useState, useEffect } from 'react'
import { buildWhatsAppLink } from '../../data/site'
import { categoryLabel } from '../../data/catalog'
import { formatBRL, discountPercent } from '../../utils/format'
import SmartImage from '../SmartImage/SmartImage'

function sizeText(product) {
  if (product.category === 'sapatos' && product.shoeSize) return `Nº ${product.shoeSize}`
  if (product.size) return product.size
  return ''
}

export default function ProductCard({ product, className = '' }) {
  const [active, setActive] = useState(0)

  const images =
    Array.isArray(product.images) && product.images.length
      ? product.images
      : [product.image || '/images/produto1.svg']

  useEffect(() => {
    setActive(0)
  }, [product.id])

  const discount = discountPercent(product.price, product.salePrice)
  const priceText =
    product.salePrice != null ? formatBRL(product.salePrice) : formatBRL(product.price)
  const size = sizeText(product)
  const multi = images.length > 1

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length)
  const next = () => setActive((i) => (i + 1) % images.length)

  return (
    <article className={`product-card ${className}`.trim()}>
      <div className="product-gallery" aria-roledescription="carrossel">
        {images.map((src, i) => (
          <div
            key={src}
            className={`gallery-slide${i === active ? ' active' : ''}`}
            aria-hidden={i !== active}
          >
            <SmartImage
              className="product-img"
              src={src}
              alt={product.alt || `${product.name} — Brechó Inove`}
              loading="lazy"
              label={product.name}
            />
          </div>
        ))}

        {discount != null && (
          <span className="product-badge">{discount}% OFF</span>
        )}

        {multi && (
          <span className="gallery-counter">
            {active + 1}/{images.length}
          </span>
        )}

        {multi && (
          <>
            <button
              className="gallery-btn gallery-prev"
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              className="gallery-btn gallery-next"
              type="button"
              onClick={next}
              aria-label="Próxima foto"
            >
              <span aria-hidden="true">›</span>
            </button>
            <div className="gallery-dots" role="tablist">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-dot${i === active ? ' active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Foto ${i + 1}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="product-info">
        <p className="product-meta">
          {categoryLabel(product.category)}
          {size ? ` • ${size}` : ''}
        </p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-price-row">
          {product.salePrice != null ? (
            <>
              <span className="product-price-old">{formatBRL(product.price)}</span>
              <span className="product-price">{priceText}</span>
            </>
          ) : (
            <span className="product-price">{priceText}</span>
          )}
        </div>
        <a
          className="btn btn-primary product-btn"
          href={buildWhatsAppLink(
            `Olá! Tenho interesse na peça "${product.name}" (${priceText}). Poderia me passar mais informações?`
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tenho interesse
        </a>
      </div>
    </article>
  )
}
