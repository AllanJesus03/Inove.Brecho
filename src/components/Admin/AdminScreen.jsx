import { useEffect, useState } from 'react'
import { api, getToken, setToken, uploadImage } from './api'
import Login from './Login'
import ProductForm from './ProductForm'
import ProductList from './ProductList'
import './AdminScreen.css'

export default function AdminScreen() {
  const [token, setTokenState] = useState(getToken)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)

  const refresh = async () => {
    const res = await api('/api/products')
    if (res.ok) {
      setProducts(await res.json())
      setError('')
      return true
    }
    setError('Falha ao carregar produtos.')
    return false
  }

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    refresh().finally(() => setLoading(false))
  }, [token])

  const handleLogin = async (password) => {
    setBusy(true)
    setError('')
    try {
      const res = await api('/api/auth', { method: 'POST', body: { password } })
      if (!res.ok) throw new Error('Senha incorreta.')
      const data = await res.json()
      setToken(data.token)
      setTokenState(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    setTokenState('')
    setEditing(null)
    setError('')
  }

  const handleSave = async (form) => {
    setBusy(true)
    setError('')
    try {
      const images = []
      for (const image of form.images) {
        if (!image) continue
        if (image.startsWith('data:')) {
          images.push(await uploadImage(image))
        } else {
          images.push(image)
        }
      }

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        size: form.size,
        shoeSize: form.shoeSize,
        condition: form.condition,
        brand: form.brand,
        color: form.color,
        price: form.price,
        salePrice: form.salePrice,
        images,
        status: form.status
      }

      const isEdit = editing && editing !== 'new'
      const res = await api(isEdit ? `/api/products/${editing.id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        body: payload
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao salvar o produto.')
      }

      await refresh()
      setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleToggleStatus = async (product) => {
    setBusy(true)
    setError('')
    try {
      const nextStatus = product.status === 'vendido' ? 'disponivel' : 'vendido'
      const res = await api(`/api/products/${product.id}`, {
        method: 'PUT',
        body: { status: nextStatus }
      })
      if (!res.ok) throw new Error('Falha ao atualizar o produto.')
      await refresh()
      if (editing?.id === product.id) setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Excluir "${product.name}" para sempre?`)) return
    setBusy(true)
    setError('')
    try {
      const res = await api(`/api/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir o produto.')
      await refresh()
      if (editing?.id === product.id) setEditing(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return <Login onLogin={handleLogin} error={error} busy={busy} />
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <p className="admin-title">
            Brechó <span>Inove</span> <em className="admin-badge">vendedora</em>
          </p>
          <div className="admin-header-actions">
            <a className="btn btn-outline admin-btn" href="#inicio">
              Ver site
            </a>
            <button className="btn btn-primary admin-btn" type="button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          {error && (
            <p className="admin-error admin-error-banner" role="alert">
              {error}
            </p>
          )}

          <div className="admin-grid">
            <div>
              <ProductForm
                key={editing ? editing.id : 'new'}
                initial={editing && editing !== 'new' ? editing : null}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                busy={busy}
              />
            </div>

            <ProductList
              products={products}
              busy={busy}
              onEdit={setEditing}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        </div>
      </main>
    </div>
  )
}