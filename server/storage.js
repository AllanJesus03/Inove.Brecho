// ============================================================
// STORAGE — Brechó Inove
// Duas densidades:
//  • LOCAL (dev): products.json + pasta uploads/  (não muda nada)
//  • PRODUÇÃO (Vercel): Upstash Redis (JSON de produtos)
//      + Vercel Blob (fotos). Detecta as env vars automaticamente.
// ============================================================

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Redis } from '@upstash/redis'
import { put } from '@vercel/blob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- MODO DETECÇÃO ------------------------------------------------------
// Se existirem as env vars da Vercel (Upstash Redis + Blob), estamos em
// produção e usamos nuvem. Senão, arquivos locais (como hoje).
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

export const isCloud = Boolean(
  process.env.VERCEL === '1' || (KV_URL && KV_TOKEN && BLOB_TOKEN)
)

// --- CONSTANTES GLOBAIS --------------------------------------------------
const MAX_IMAGES = 3
const PRODUCTS_KEY = 'brecho:productos'

const DATA_DIR = path.join(__dirname, 'data')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')

const CATEGORY_VALUES = ['roupas', 'sapatos', 'acessorios', 'bolsas', 'outros']
const CONDITION_VALUES = ['novo', 'semi-novo', 'usado']
const STATUS_VALUES = ['disponivel', 'vendido']

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
  const rawSale =
    p.salePrice == null || p.salePrice === '' ? null : parsePrice(p.salePrice)
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

// ============================ BACKEND LOCAL =============================
fs.mkdirSync(UPLOADS_DIR, { recursive: true })
fs.mkdirSync(DATA_DIR, { recursive: true })

function readLocal() {
  try {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.map(normalizeProduct).filter(Boolean) : []
  } catch {
    return []
  }
}

function writeLocal(list) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(list, null, 2))
}

async function uploadLocal(data) {
  const match = data.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return { error: 'Imagem inválida.' }

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 8 * 1024 * 1024) return { error: 'Imagem muito grande.', status: 413 }

  const filename = `img-${Date.now()}.${ext}`
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer)
  return { url: `/uploads/${filename}` }
}

// ============================ BACKEND NUVEM =============================
async function uploadCloud(data) {
  const match = data.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return { error: 'Imagem inválida.' }

  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 8 * 1024 * 1024) return { error: 'Imagem muito grande.', status: 413 }

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
  const blob = await put(`brecho/${filename}`, buffer, {
    access: 'public',
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
  })
  return { url: blob.url }
}

// ============================ API UNIFICADA =============================
export async function getProducts() {
  if (isCloud) {
    try {
      const kv = new Redis({ url: KV_URL, token: KV_TOKEN })
      const raw = await kv.get(PRODUCTS_KEY)
      if (!raw) return null
      const list = JSON.parse(raw)
      return Array.isArray(list) ? list.map(normalizeProduct).filter(Boolean) : null
    } catch (err) {
      console.error('[storage] Falha ao ler do Redis:', err)
      return null
    }
  }
  return readLocal()
}

export async function putProducts(list) {
  const normalized = list.map(normalizeProduct).filter(Boolean)
  if (isCloud) {
    const kv = new Redis({ url: KV_URL, token: KV_TOKEN })
    await kv.set(PRODUCTS_KEY, JSON.stringify(normalized))
    return normalized
  }
  writeLocal(normalized)
  return normalized
}

export async function uploadImage(data) {
  return isCloud ? uploadCloud(data) : uploadLocal(data)
}

// Seed idempotente (usado pelo app: em dev cria o arquivo, em produção
// popula o Redis na primeira execução).
export async function seedIfEmpty() {
  const list = await getProducts()
  if (list && list.length) return
  await putProducts(DEFAULT_PRODUCTS)
}
