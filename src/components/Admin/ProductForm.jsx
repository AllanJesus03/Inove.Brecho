import { useState } from 'react'
import { readImageFile } from './api'
import {
  CATEGORIES,
  CLOTHING_SIZES,
  SHOE_SIZES,
  CONDITIONS,
  STATUS
} from '../../data/catalog'
import { formatBRL, parseBRL } from '../../utils/format'

const MAX_PHOTOS = 3

export default function ProductForm({ initial, onSave, onCancel, busy }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [category, setCategory] = useState(initial?.category || 'roupas')
  const [size, setSize] = useState(initial?.size || '')
  const [shoeSize, setShoeSize] = useState(initial?.shoeSize || '')
  const [condition, setCondition] = useState(initial?.condition || 'semi-novo')
  const [brand, setBrand] = useState(initial?.brand || '')
  const [color, setColor] = useState(initial?.color || '')
  const [price, setPrice] = useState(initial?.price ? String(initial.price).replace('.', ',') : '')
  const [salePrice, setSalePrice] = useState(
    initial?.salePrice != null ? String(initial.salePrice).replace('.', ',') : ''
  )
  const [status, setStatus] = useState(initial?.status || 'disponivel')
  const [photos, setPhotos] = useState(() =>
    Array.from({ length: MAX_PHOTOS }, (_, i) => initial?.images?.[i] || '')
  )
  const [formError, setFormError] = useState('')

  const mainPhotoIndex = photos.findIndex((photo) => photo !== '')

  const handlePhoto = async (index, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const data = await readImageFile(file)
      setPhotos((prev) => prev.map((p, i) => (i === index ? data : p)))
    } catch {
      setFormError('Não foi possível processar a imagem.')
    }
    event.target.value = ''
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? '' : p)))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const priceValue = parseBRL(price)
    const saleValue = salePrice.trim() ? parseBRL(salePrice) : null

    if (!name.trim()) return setFormError('Informe o nome da peça.')
    if (!priceValue || priceValue <= 0) return setFormError('Informe um preço válido.')
    if (saleValue != null && (saleValue <= 0 || saleValue >= priceValue)) {
      return setFormError('O preço promocional precisa ser menor que o preço.')
    }

    const images = photos.filter(Boolean)
    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      size: category === 'sapatos' ? '' : size.trim(),
      shoeSize: category === 'sapatos' ? shoeSize.trim() : '',
      condition,
      brand: brand.trim(),
      color: color.trim(),
      price: priceValue,
      salePrice: saleValue,
      images,
      status
    })
  }

  return (
    <form className="admin-card" onSubmit={handleSubmit}>
      <h2 className="admin-card-title">
        {initial ? `Editar: ${initial.name}` : 'Adicionar produto'}
      </h2>

      <div className="admin-fields">
        {/* Informações */}
        <p className="admin-section">Informações</p>

        <div className="admin-field">
          <label htmlFor="p-name">Nome da peça *</label>
          <input
            id="p-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Jaqueta Vintage"
            required
          />
        </div>

        <div className="admin-field">
          <label htmlFor="p-desc">Descrição</label>
          <input
            id="p-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Peça selecionada • Tamanho M"
          />
        </div>

        <div className="admin-row2">
          <div className="admin-field">
            <label htmlFor="p-category">Categoria *</label>
            <select
              id="p-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="p-condition">Estado da peça</label>
            <select
              id="p-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {CONDITIONS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-row2">
          <div className="admin-field">
            <label htmlFor="p-brand">Marca</label>
            <input
              id="p-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex.: Zara"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="p-color">Cor</label>
            <input
              id="p-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Ex.: Preto"
            />
          </div>
        </div>

        {/* Tamanho */}
        <p className="admin-section">Tamanho</p>

        {category === 'sapatos' ? (
          <div className="admin-field">
            <label htmlFor="p-shoe">Numeração (calçado)</label>
            <select id="p-shoe" value={shoeSize} onChange={(e) => setShoeSize(e.target.value)}>
              <option value="">Selecione a numeração</option>
              {SHOE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : category === 'roupas' ? (
          <div className="admin-field">
            <label htmlFor="p-size">Tamanho</label>
            <select id="p-size" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="">Selecione o tamanho</option>
              {CLOTHING_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="admin-field">
            <label htmlFor="p-size">Tamanho / medidas (opcional)</label>
            <input
              id="p-size"
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Ex.: Único, 38 cm, Livre…"
            />
          </div>
        )}

        {/* Preço */}
        <p className="admin-section">Preço</p>

        <div className="admin-row2">
          <div className="admin-field">
            <label htmlFor="p-price">Preço *</label>
            <input
              id="p-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex.: 89,90"
              required
            />
          </div>

          <div className="admin-field">
            <label htmlFor="p-sale">Preço promocional (oferta)</label>
            <input
              id="p-sale"
              type="text"
              inputMode="decimal"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="Opcional — ex.: 69,90"
            />
          </div>
        </div>

        {(() => {
          const p = parseBRL(price)
          const s = salePrice.trim() ? parseBRL(salePrice) : null
          if (p == null || p <= 0) return null
          return (
            <p className="admin-price-preview">
              Exibido no site: {formatBRL(p)}
              {s != null && s > 0 && s < p && (
                <>
                  {' '}
                  <span className="admin-price-old">{formatBRL(p)}</span>
                  <strong> {formatBRL(s)}</strong>
                  <em className="admin-badge admin-badge-sale">Oferta</em>
                </>
              )}
            </p>
          )
        })()}

        {/* Fotos */}
        <p className="admin-section">
          Fotos <span className="admin-section-note">até {MAX_PHOTOS}, a primeira é a principal</span>
        </p>

        <div className="admin-photos">
          {photos.map((photo, index) => (
            <div className={`admin-photo${photo ? ' filled' : ''}`} key={index}>
              {photo ? (
                <>
                  <img src={photo} alt={`Foto ${index + 1}`} />
                  {mainPhotoIndex === index && <span className="admin-photo-main">Principal</span>}
                  <button
                    type="button"
                    className="admin-photo-remove"
                    aria-label={`Remover foto ${index + 1}`}
                    onClick={() => removePhoto(index)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label className="admin-photo-add">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhoto(index, e)}
                  />
                  <span>+ Foto</span>
                </label>
              )}
            </div>
          ))}
        </div>

        {/* Status */}
        <p className="admin-section">
          Status <span className="admin-section-note">vendido = some do site</span>
        </p>

        <div className="admin-status-row">
          {STATUS.map((st) => (
            <label className={`admin-status-opt${status === st.value ? ' on' : ''}`} key={st.value}>
              <input
                type="radio"
                name="status"
                value={st.value}
                checked={status === st.value}
                onChange={(e) => setStatus(e.target.value)}
              />
              {st.label}
            </label>
          ))}
        </div>
      </div>

      {formError && (
        <p className="admin-error" role="alert">
          {formError}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Salvando…' : initial ? 'Salvar alterações' : 'Adicionar produto'}
        </button>
        {initial && (
          <button className="btn btn-outline" type="button" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}