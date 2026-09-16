const ITEMS = [
  {
    title: 'Peças selecionadas',
    text: 'Produtos escolhidos com atenção para oferecer qualidade e estilo.',
    icon: 'hanger'
  },
  {
    title: 'Preços acessíveis',
    text: 'Moda com boas oportunidades para você renovar seu guarda-roupa.',
    icon: 'tag'
  },
  {
    title: 'Estilo único',
    text: 'Peças que ajudam você a criar combinações diferentes e autênticas.',
    icon: 'sparkle'
  },
  {
    title: 'Compra fácil',
    text: 'Entre em contato, escolha sua peça e finalize sua compra de forma simples.',
    icon: 'bag'
  }
]

function Icon({ name }) {
  const props = {
    className: 'diff-icon',
    width: '26',
    height: '26',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }

  switch (name) {
    case 'hanger':
      return (
        <svg {...props}>
          <path d="M12 4a2 2 0 1 1 2 2c-1.5 1-3 2.2-3.6 3.6A4 4 0 0 0 10 12" />
          <path d="M3 20h18l-3.5-8a2.5 2.5 0 0 0-4.6.4l-.9 2" />
          <path d="M3 20h18" />
        </svg>
      )
    case 'tag':
      return (
        <svg {...props}>
          <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2" />
        </svg>
      )
    case 'bag':
      return (
        <svg {...props}>
          <path d="M6 7h12l1 13H5L6 7Z" />
          <path d="M9 10V6a3 3 0 0 1 6 0v4" />
        </svg>
      )
    default:
      return null
  }
}

export default function Diferenciais() {
  return (
    <section className="section diffs" id="diferenciais">
      <div className="container">
        <h2 className="section-title" data-reveal>
          Por que escolher o <span>Brechó Inove?</span>
        </h2>

        <div className="diffs-grid">
          {ITEMS.map((item, index) => (
            <div className="diff-card" key={item.title} data-reveal>
              <div className="diff-icon-wrap">
                <Icon name={item.icon} />
              </div>
              <h3 className="diff-title">{item.title}</h3>
              <p className="diff-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}