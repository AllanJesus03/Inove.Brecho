const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Contato', href: '#contato' }
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">
            Brechó <span>Inove</span>
          </p>
          <p className="footer-tag">Estilo que encontra você.</p>
        </div>

        <nav className="footer-nav" aria-label="Rodapé">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="footer-admin" href="#/admin">
            Admin
          </a>
        </nav>

        <p className="footer-copy">© 2026 Brechó Inove. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}