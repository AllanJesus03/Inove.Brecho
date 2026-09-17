export function formatBRL(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

export function parseBRL(input) {
  if (input == null || input === '') return null
  if (typeof input === 'number') return Number.isFinite(input) ? input : null

  const raw = String(input).replace(/[^\d,.-]/g, '').trim()
  if (!raw) return null

  let normalized = raw
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  }

  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

export function discountPercent(price, salePrice) {
  const base = Number(price)
  const sale = Number(salePrice)
  if (!Number.isFinite(base) || !Number.isFinite(sale) || base <= 0 || sale <= 0 || sale >= base) {
    return null
  }
  return Math.round(((base - sale) / base) * 100)
}

export function mainImage(product) {
  if (Array.isArray(product?.images) && product.images.length) {
    return product.images[0]
  }
  return product?.image || ''
}