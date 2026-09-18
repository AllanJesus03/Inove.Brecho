// ============================================================
// API — Brechó Inove (função serverless do Vercel)
// ------------------------------------------------------------
// O Vercel roteia /api/* para a pasta /api na raiz e chama a
// função exportada com assinatura (req, res).
//
// Express app é simplesmente uma função (req, res) → o Express
// cuida de body, rotas, json etc. Nada de wrapper serverless-http
// (evita dependências frágeis / hangs), nada de listen.
//
// Toda a lógica vive em server/app.js (compartilhado entre o dev
// local e a cloud) → zero duplicação.
// ============================================================

import app from '../server/app.js'

export const handler = (req, res) => {
  app(req, res)
}

export default handler
