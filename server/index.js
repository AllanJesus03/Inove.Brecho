// ============================================================
// LADO LOCAL (npm run dev / npm start) — Brechó Inove
// Um wrapper FINO em volta do app Express compartilhado
// (server/app.js) + storage (server/storage.js).
// A lógica de produtos/uploads/auth mora EM app.js — aqui apenas
// servimos uploads estáticos, o build (dist) quando existir, e
// subimos o server local. Mesmo code path do Vercel.
// ============================================================

import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import { fileURLToPath } from 'node:url'
import app, { UPLOADS_DIR_PATH } from './app.js'
import { PORT } from './config.js'
import { seedIfEmpty } from './storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')

// Garante as pastas locais (uploads/data) — idempotente.
fs.mkdirSync(UPLOADS_DIR_PATH, { recursive: true })

// Seed idempotente no backend local (igual ao antigo server/index.js).
await seedIfEmpty()

// Uploads, só em dev (produção usa Vercel Blob).
app.use(
  '/uploads',
  express.static(UPLOADS_DIR_PATH, { immutable: true, maxAge: '30d' })
)

// SPA buildada — em produção o Vercel serve o dist, aqui servimos do disco.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
}

app.listen(PORT, () => {
  console.log(`Brechó Inove API rodando em http://localhost:${PORT}`)
})
