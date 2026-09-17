import { useState } from 'react'

export default function Login({ onLogin, error, busy }) {
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin(password)
  }

  return (
    <div className="admin-login">
      <div className="admin-card admin-login-card">
        <h1 className="admin-title">
          Brechó <span>Inove</span>
        </h1>
        <p className="admin-subtitle">Área da vendedora — cadastro e controle de produtos</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label htmlFor="admin-password">Senha</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn-primary admin-submit" type="submit" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <a className="admin-back" href="#inicio">
          ← Voltar ao site
        </a>
      </div>
    </div>
  )
}