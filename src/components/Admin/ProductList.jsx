import { useState } from 'react'
import { categoryLabel } from '../../data/catalog'
import { formatBRL, discountPercent, mainImage } from '../../utils/format'

const FILTERS = [
  { value: 'todos', label: 'Todas' },
  { value: 'disponiveis', label: 'Disponíveis' },
  { value: 'ofertas', label: 'Em oferta' },
  { value: 'vendidos', label: 'Vendidos' }
]

export default function ProductList({ products, busy, onEdit, onDelete, onToggleStatus }) {
  const [filter, setFilter] = useState('todos')

  const filtered = products.filter((product) => {
    if (filter === 'disponiveis') return product.status === 'disponivel'
    if (filter === 'ofertas') return product.status === 'disponivel' && product.salePrice != null
    if (filter === 'vendidos') return product.status === 'vendido'
    return true
  })

  const isFilterEmpty = filtered.length === 0

  return (
    <section className="admin-list" aria-label="Produtos cadastrados">
      <h2 className="admin-card-title">Produtos no site ({products.length})</h2>

      <div className="admin-chips">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip${filter === f.value ? ' on' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isFilterEmpty ? (
        <p className="admin-status">
          Nenhum produto {filter === 'vendidos' ? 'vendido' : filter === 'ofertas' ? 'em oferta' : filter === 'disponiveis' ? 'disponível' : ''} ainda.
        </p>
      ) : (
        <div className="admin-items">
          {filtered.map((product) => {
            const image = mainImage(product)
            const discount = discountPercent(product.price, product.salePrice)
            const sold = product.status === 'vendido'

            return (
              <div className={`admin-item${sold ? ' sold' : ''}`} key={product.id}>
                {image && <img src={image} alt="" className="admin-item-img" />}

                <div className="admin-item-meta">
                  <p className="admin-item-name">{product.name}</p>
                  <p className="admin-item-sub">
                    {categoryLabel(product.category)}
                    {product.size ? ` • ${product.size}` : product.shoeSize ? ` • Nº ${product.shoeSize}` : ''}
                  </p>
                  <p className="admin-item-price">
                    {formatBRL(product.price)}
                    {discount != null && (
                      <>
                        <span className="admin-price-old"> {formatBRL(product.price)}</span>
                        <span className="admin-price-sale"> {formatBRL(product.salePrice)}</span>
                      </>
                    )}
                  </p>
                  <p className="admin-item-status">
                    <span className={`admin-tag ${sold ? 'tag-sold' : 'tag-ok'}`}>
                      {sold ? 'Vendido' : discount != null ? 'Oferta' : 'Disponível'}
                    </span>
                  </p>
                </div>

                <div className="admin-item-actions">
                  {!sold && (
                    <button
                      className="btn btn-outline admin-btn"
                      type="button"
                      onClick={() => onToggleStatus(product)}
                      disabled={busy}
                      title="Marca como vendido e remove do site"
                    >
                      Marcar vendido
                    </button>
                  )}
                  {sold && (
                    <button
                      className="btn btn-outline admin-btn"
                      type="button"
                      onClick={() => onToggleStatus(product)}
                      disabled={busy}
                      title="Volta o produto para disponível no site"
                    >
                      Reativar
                    </button>
                  )}
                  <button
                    className="btn btn-outline admin-btn"
                    type="button"
                    onClick={() => onEdit(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-outline admin-btn admin-btn-danger"
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={busy}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="admin-list-hint">
        Marque <strong>“Vendido”</strong> para tirar a peça do site. Ela continua aqui no histórico
        e pode voltar a ficar disponível quando quiser.
      </p>
    </section>
  )
}