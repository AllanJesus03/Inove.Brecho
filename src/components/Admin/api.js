const TOKEN_KEY = 'inove_admin_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const body = options.body

  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) headers['x-admin-token'] = token

  return fetch(path, {
    ...options,
    headers,
    body: body && typeof body === 'object' ? JSON.stringify(body) : body
  })
}

export async function uploadImage(dataUrl) {
  const res = await api('/api/upload', { method: 'POST', body: { data: dataUrl } })
  if (!res.ok) throw new Error('Falha ao enviar a imagem.')
  const data = await res.json()
  return data.url
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 900
        let { width, height } = img
        if (width > height && width > max) {
          height = Math.round((height * max) / width)
          width = max
        } else if (height >= width && height > max) {
          width = Math.round((width * max) / height)
          height = max
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      img.src = reader.result
    }

    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(file)
  })
}