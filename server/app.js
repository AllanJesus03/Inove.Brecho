// ============================================================
// APP — Brechó Inove (Express compartilhado)
// Funciona tanto no servidor local (com server/index.js) quanto
// como função serverless no Vercel (com api/index.js).
// NÃO chama app.listen aqui.
// ============================================================

import crypto from 'node:crypto'
import express from 'express'
import {
  getProducts,
  putProducts,
  uploadImage,
  seedIfEmpty,
  isCloud
} from './storage.js'

// --- VALORES VÁLIDOS -----------------------------------------------------
const CATEGORY_VALUES = ['roupas', 'sapatos', 'acessorios', 'bolsas', 'outros']
const CONDITION_VALUES = ['novo', 'semi-novo', 'usado']
const STATUS_VALUES = ['disponivel', 'vendido']
const MAX_IMAGES = 3

// --- AUTENTICAÇÃO ESTATELESS (HMAC) --------------------------------------
// Token assinado com a ADMIN_PASSWORD. Como o Vercel é serverless (sem
// memória compartilhada), não usamos Set(). Cada request valida a assinatura.
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'inove123'

function sign(value) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update(value).digest('hex')
}

function createToken() {
  const payload = `${Date.now()}.${Math.random().toString(36).slice(2)}`
  return `${payload}.${sign(payload)}`
}

function isValidToken(token) {
  if (typeof token !== 'string' || !token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [before, after, sig] = parts
  if (!before || !after) return false

  const expected = sign(`${before}.${after}`)
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!isValidToken(token)) {
    return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' })
  }
  next()
}

const app = express()
app.use(express.json({ limit: '20mb' }))

// ==================== ROTAS =============================================

app.get('/api/products', async (_req, res) => {
  const list = await getProducts()
  res.json(list || [])
})

app.post('/api/auth', (req, res) => {
  const { password } = req.body || {}
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  res.json({ token: createToken(), password })
})

app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const list = (await getProducts()) || []
    const body = req.body || {}

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ error: 'Informe o nome do produto.' })
    }

    const images = Array.isArray(body.images)
      ? body.images.filter((img) => typeof img === 'string' && img).slice(0, MAX_IMAGES)
      : []

    const product = {
      id: `produto-${Date.now()}`,
      name: body.name.trim(),
      category: CATEGORY_VALUES.includes(body.category) ? body.category : 'outros',
      size: typeof body.size === 'string' ? body.size : '',
      shoeSize: typeof body.shoeSize === 'string' ? body.shoeSize : '',
      condition: CONDITION_VALUES.includes(body.condition) ? body.condition : 'semi-novo',
      brand: typeof body.brand === 'string' ? body.brand.trim() : '',
      color: typeof body.color === 'string' ? body.color.trim() : '',
      price: parsePrice(body.price),
      salePrice: parseSalePrice(body.salePrice, body.price),
      description: typeof body.description === 'string' ? body.description.trim() : '',
      images,
      image: images[0] || '',
      alt: `${body.name.trim()} — Brechó Inove`,
      status: STATUS_VALUES.includes(body.status) ? body.status : 'disponivel',
      createdAt: Date.now()
    }

    list.push(product)
    const saved = await putProducts(list)
    res.status(201).json((saved.find((p) => p.id === product.id)) || product)
  } catch (err) {
    console.error('[app] Falha ao criar produto:', err)
    res.status(500).json({ error: 'Falha ao salvar o produto.' })
  }
})

app.put('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const list = (await getProducts()) || []
    const index = list.findIndex((p) => p.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado.' })

    const body = req.body || {}
    const current = list[index]
    const updated = { ...current }

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return res.status(400).json({ error: 'Informe o nome do produto.' })
      }
      updated.name = body.name.trim()
      updated.alt = `${updated.name} — Brechó Inove`
    }
    if (body.category !== undefined && CATEGORY_VALUES.includes(body.category)) {
      updated.category = body.category
    }
    if (body.condition !== undefined && CONDITION_VALUES.includes(body.condition)) {
      updated.condition = body.condition
    }
    if (body.status !== undefined && STATUS_VALUES.includes(body.status)) {
      updated.status = body.status
    }
    if (body.size !== undefined) updated.size = typeof body.size === 'string' ? body.size : ''
    if (body.shoeSize !== undefined)
      updated.shoeSize = typeof body.shoeSize === 'string' ? body.shoeSize : ''
    if (body.brand !== undefined) updated.brand = typeof body.brand === 'string' ? body.brand.trim() : ''
    if (body.color !== undefined) updated.color = typeof body.color === 'string' ? body.color.trim() : ''
    if (body.description !== undefined)
      updated.description = typeof body.description === 'string' ? body.description.trim() : ''

    if (body.price !== undefined) {
      const price = parsePrice(body.price)
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: 'Informe um preço válido.' })
      }
      updated.price = price
    }
    if (body.salePrice !== undefined) {
      const salePrice = parseSalePrice(body.salePrice, updated.price)
      if (salePrice != null && salePrice <= 0) {
        return res.status(400).json({ error: 'O preço promocional deve ser menor que o preço.' })
      }
      updated.salePrice = salePrice
    }

    if (body.images !== undefined) {
      updated.images = Array.isArray(body.images)
        ? body.images.filter((img) => typeof img === 'string' && img).slice(0, MAX_IMAGES)
        : []
      updated.image = updated.images[0] || ''
    }

    if (body.image !== undefined && typeof body.image === 'string') {
      updated.images = [body.image]
      updated.image = body.image
    }

    list[index] = updated
    const saved = await putProducts(list)
    res.json(saved.find((p) => p.id === updated.id) || updated)
  } catch (err) {
    console.error('[app] Falha ao atualizar produto:', err)
    res.status(500).json({ error: 'Falha ao atualizar o produto.' })
  }
})

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const list = (await getProducts()) || []
    const next = list.filter((p) => p.id !== req.params.id)
    await putProducts(next)
    res.json({ ok: true })
  } catch (err) {
    console.error('[app] Falha ao excluir produto:', err)
    res.status(500).json({ error: 'Falha ao excluir o produto.' })
  }
})

app.post('/api/upload', requireAuth, async (req, res) => {
  try {
    const { data } = req.body || {}
    if (!data || typeof data !== 'string' || !data.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Imagem inválida.' })
    }
    const result = await uploadImage(data)
    if (result.error) return res.status(result.status || 400).json({ error: result.error })
    res.status(201).json({ url: result.url })
  } catch (err) {
    console.error('[app] Falha no upload de imagem:', err)
    res.status(500).json({ error: 'Falha ao enviar a imagem.' })
  }
})

// Para manter o comportamento local (uploads servidos estaticamente em dev),
// o server/index.js registra express.static; aqui deixamos o path exposto.
export const UPLOADS_DIR_PATH =
  process.env.UPLOADS_DIR || new URL('./uploads', import.meta.url).pathname

// ==================== SEED IDEMPOTENTE =================================
let seeding = false
export async function ensureSeeded() {
  if (seeding) return
  seeding = true
  try {
    await seedIfEmpty()
  } finally {
    seeding = false
  }
}

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0

  const raw = value.replace(/[^\d,.-]/g, '').trim()
  if (!raw) return 0

  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  const num = Number(normalized)
  return Number.isFinite(num) ? num : 0
}

function parseSalePrice(value, priceValue) {
  if (value == null || value === '') return null
  const sale = parsePrice(value)
  const price = parsePrice(priceValue)
  if (sale > 0 && sale < price) return sale
  return null
}

export default app
