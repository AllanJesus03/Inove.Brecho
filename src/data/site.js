// ============================================================
// DADOS DE CONTATO — SUBSTITUA AQUI OS VALORES REAIS
// WhatsApp: número no formato internacional com código do país (ex.: 55DDD...)
// Instagram: perfil público do Brechó Inove
// ============================================================

export const WHATSAPP_NUMBER = '5511999999999'

export const INSTAGRAM_URL = 'https://instagram.com/brecho.inove'

export function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WHATSAPP_LINK = buildWhatsAppLink(
  'Olá! Vim pelo site do Brechó Inove e gostaria de mais informações.'
)