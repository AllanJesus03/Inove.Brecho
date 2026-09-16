import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Contato', href: '#contato' }
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-inner">
        <a
          className="logo"
          href="#inicio"
          onClick={() => setOpen(false)}
          aria-label="Brechó Inove — voltar ao início"
        >
          Brechó <span>Inove</span>
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="btn btn-primary" href="#produtos">
            Ver produtos
          </a>
        </nav>

        <button
          className={`burger${open ? ' active' : ''}`}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
        <a className="btn btn-primary mobile-cta" href="#produtos" onClick={() => setOpen(false)}>
          Ver produtos
        </a>
      </div>
    </header>
  )
}