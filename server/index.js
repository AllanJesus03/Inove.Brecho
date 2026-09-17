import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { ADMIN_PASSWORD, PORT } from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATA_DIR = path.join(__dirname, 'data')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const DIST_DIR = path.join(__dirname, '..', 'dist')

const CATEGORY_VALUES = ['roupas', 'sapatos', 'acessorios', 'bolsas', 'outros']
const CONDITION_VALUES = ['novo', 'semi-novo', 'usado']
const STATUS_VALUES = ['disponivel', 'vendido']
const MAX_IMAGES = 3

const DEFAULT_PRODUCTS = [
  {
    id: 'produto-1',
    name: 'Jaqueta Vintage',
    category: 'roupas',
    size: 'M',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Preto',
    price: 89.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho M',
    images: ['/images/produto1.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-2',
    name: 'Camisa Social Slim',
    category: 'roupas',
    size: 'G',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Branco',
    price: 49.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho G',
    images: ['/images/produto2.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-3',
    name: 'Vestido Midi Elegante',
    category: 'roupas',
    size: 'P',
    shoeSize: '',
    condition: 'novo',
    brand: '',
    color: 'Roxo',
    price: 79.9,
    salePrice: null,
    description: 'Peça selecionada • Tamanho P',
    images: ['/images/produto3.svg'],
    status: 'disponivel'
  },
  {
    id: 'produto-4',
    name: 'Blazer Alfaiataria',
    category: 'roupas',
    size: 'M',
    shoeSize: '',
    condition: 'semi-novo',
    brand: '',
    color: 'Preto',
    price: 119.9,
    salePrice: 99.9,
    description: 'Peça selecionada • Tamanho M',
    images: ['/images/produto4.svg'],
    status: 'disponivel'
  }
]

fs.mkdirSync(UPLOADS_DIR, { recursive: true })
fs.mkdirSync(DATA_DIR, { recursive: true })

function parsePrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0

  const raw = value.replace(/[^\d,.-]/g, '').trim()
  if (!raw) return 0

  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  const num = Number(normalized)
  return Number.isFinite(num) ? num : 0
}

function normalizeProduct(p) {
  if (!p || typeof p !== 'object') return null

  const name = typeof p.name === 'string' ? p.name.trim() : 'Produto'

  let status = p.status
  if (!STATUS_VALUES.includes(status)) {
    status = p.available === false ? 'vendido' : 'disponivel'
  }

  let images = []
  if (Array.isArray(p.images) && p.images.length) {
    images = p.images.filter((img) => typeof img === 'string' && img)
  } else if (typeof p.image === 'string' && p.image) {
    images = [p.image]
  }

  const price = parsePrice(p.price)
  const rawSale = p.salePrice == null || p.salePrice === '' ? null : parsePrice(p.salePrice)
  const salePrice =
    rawSale != null && rawSale > 0 && rawSale < price && rawSale !== price ? rawSale : null

  return {
    id: typeof p.id === 'string' && p.id ? p.id : `produto-${Date.now()}`,
    name,
    category: CATEGORY_VALUES.includes(p.category) ? p.category : 'outros',
    size: typeof p.size === 'string' ? p.size : '',
    shoeSize: typeof p.shoeSize === 'string' ? p.shoeSize : '',
    condition: CONDITION_VALUES.includes(p.condition) ? p.condition : 'semi-novo',
    brand: typeof p.brand === 'string' ? p.brand.trim() : '',
    color: typeof p.color === 'string' ? p.color.trim() : '',
    price,
    salePrice,
    description: typeof p.description === 'string' ? p.description.trim() : '',
    images: images.slice(0, MAX_IMAGES),
    image: images[0] || '',
    alt: `${name} — Brechó Inove`,
    status,
    createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now()
  }
}

function readProducts() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.map(normalizeProduct).filter(Boolean) : []
  } catch {
    return []
  }
}

function writeProducts(list) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2))
}

function seedOrMigrate() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    writeProducts(DEFAULT_PRODUCTS)
    return
  }

  const normalized = readProducts()
  writeProducts(normalized)
}

seedOrMigrate()

const sessions = new Set()

function createToken() {
  const token = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
  sessions.add(token)
  return token
}

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' })
  }
  next()
}

const app = express()
app.use(express.json({ limit: '15mb' }))

app.get('/api/products', (_req, res) => {
  res.json(readProducts())
})

app.post('/api/auth', (req, res) => {
  const { password } = req.body || {}
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta.' })
  }
  res.json({ token: createToken() })
})

app.post('/api/products', requireAuth, (req, res) => {
  const body = req.body || {}

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return res.status(400).json({ error: 'Informe o nome do produto.' })
  }
  const price = parsePrice(body.price)
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'Informe um preço válido.' })
  }
  if (body.category && !CATEGORY_VALUES.includes(body.category)) {
    return res.status(400).json({ error: 'Categoria inválida.' })
  }
  if (body.condition && !CONDITION_VALUES.includes(body.condition)) {
    return res.status(400).json({ error: 'Estado da peça inválido.' })
  }
  if (body.status && !STATUS_VALUES.includes(body.status)) {
    return res.status(400).json({ error: 'Status inválido.' })
  }

  const salePrice = body.salePrice == null || body.salePrice === '' ? null : parsePrice(body.salePrice)
  if (salePrice != null && (salePrice <= 0 || salePrice >= price)) {
    return res.status(400).json({ error: 'O preço promocional deve ser menor que o preço.' })
  }

  const images = Array.isArray(body.images)
    ? body.images.filter((img) => typeof img === 'string' && img).slice(0, MAX_IMAGES)
    : []

  const cleanName = body.name.trim()
  const product = {
    id: `produto-${Date.now()}`,
    name: cleanName,
    category: body.category || 'outros',
    size: typeof body.size === 'string' ? body.size : '',
    shoeSize: typeof body.shoeSize === 'string' ? body.shoeSize : '',
    condition: body.condition || 'semi-novo',
    brand: typeof body.brand === 'string' ? body.brand.trim() : '',
    color: typeof body.color === 'string' ? body.color.trim() : '',
    price,
    salePrice,
    description: typeof body.description === 'string' ? body.description.trim() : '',
    images,
    image: images[0] || '',
    alt: `${cleanName} — Brechó Inove`,
    status: body.status || 'disponivel',
    createdAt: Date.now()
  }

  const list = readProducts()
  list.push(product)
  writeProducts(list)
  res.status(201).json(product)
})

app.put('/api/products/:id', requireAuth, (req, res) => {
  const { id } = req.params
  const list = readProducts()
  const index = list.findIndex((p) => p.id === id)
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado.' })

  const current = list[index]
  const body = req.body || {}
  const updated = { ...current }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return res.status(400).json({ error: 'Informe o nome do produto.' })
    }
    updated.name = body.name.trim()
  }
  if (body.category !== undefined) {
    if (!CATEGORY_VALUES.includes(body.category)) {
      return res.status(400).json({ error: 'Categoria inválida.' })
    }
    updated.category = body.category
  }
  if (body.condition !== undefined) {
    if (!CONDITION_VALUES.includes(body.condition)) {
      return res.status(400).json({ error: 'Estado da peça inválido.' })
    }
    updated.condition = body.condition
  }
  if (body.status !== undefined) {
    if (!STATUS_VALUES.includes(body.status)) {
      return res.status(400).json({ error: 'Status inválido.' })
    }
    updated.status = body.status
  }

  if (body.price !== undefined) {
    const price = parsePrice(body.price)
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Informe um preço válido.' })
    }
    updated.price = price
  }

  const price = updated.price
  if (body.salePrice !== undefined) {
    const salePrice = body.salePrice == null || body.salePrice === '' ? null : parsePrice(body.salePrice)
    if (salePrice != null && (salePrice <= 0 || salePrice >= price)) {
      return res.status(400).json({ error: 'O preço promocional deve ser menor que o preço.' })
    }
    updated.salePrice = salePrice
  } else if (updated.salePrice != null && updated.salePrice >= price) {
    updated.salePrice = null
  }

  if (body.description !== undefined) {
    updated.description = typeof body.description === 'string' ? body.description.trim() : ''
  }
  if (body.size !== undefined) updated.size = typeof body.size === 'string' ? body.size : ''
  if (body.shoeSize !== undefined) updated.shoeSize = typeof body.shoeSize === 'string' ? body.shoeSize : ''
  if (body.brand !== undefined) updated.brand = typeof body.brand === 'string' ? body.brand.trim() : ''
  if (body.color !== undefined) updated.color = typeof body.color === 'string' ? body.color.trim() : ''

  if (body.images !== undefined) {
    updated.images = Array.isArray(body.images)
      ? body.images.filter((img) => typeof img === 'string' && img).slice(0, MAX_IMAGES)
      : []
    updated.image = updated.images[0] || ''
  }

  updated.alt = `${updated.name} — Brechó Inove`

  list[index] = updated
  writeProducts(list)
  res.json(updated)
})

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const { id } = req.params
  const list = readProducts().filter((p) => p.id !== id)
  writeProducts(list)
  res.json({ ok: true })
})

app.post('/api/upload', requireAuth, (req, res) => {
  const { data } = req.body || {}
  if (!data || typeof data !== 'string' || !data.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Imagem inválida.' })
  }

  const match = data.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return res.status(400).json({ error: 'Imagem inválida.' })

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 8 * 1024 * 1024) {
    return res.status(413).json({ error: 'Imagem muito grande.' })
  }

  const filename = `img-${Date.now()}.${ext}`
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer)
  res.status(201).json({ url: `/uploads/${filename}` })
})

app.use('/uploads', express.static(UPLOADS_DIR, { immutable: true, maxAge: '30d' }))

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
}

app.listen(PORT, () => {
  console.log(`Brechó Inove API rodando em http://localhost:${PORT}`)
})