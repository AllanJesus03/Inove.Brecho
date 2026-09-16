import products from '../../data/products'
import { buildWhatsAppLink } from '../../data/site'
import SmartImage from '../SmartImage/SmartImage'

export default function Produtos() {
  return (
    <section className="section products" id="produtos">
      <div className="container">
        <h2 className="section-title" data-reveal>
          Destaques <span>do Inove</span>
        </h2>

        <div className="products-grid">
          {products.map((product, index) => (
            <article
              className="product-card"
              key={product.id}
              data-reveal
              style={{ transitionDelay: `${(index % 4) * 0.07}s` }}
            >
              <div className="product-img-wrap">
                <SmartImage
                  className="product-img"
                  src={product.image}
                  alt={product.alt}
                  loading="lazy"
                  label={product.name}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <p className="product-price">{product.price}</p>
                <a
                  className="btn btn-primary product-btn"
                  href={buildWhatsAppLink(
                    `Olá! Tenho interesse na peça "${product.name}" (${product.price}). Poderia me passar mais informações?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tenho interesse
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}