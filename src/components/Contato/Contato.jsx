import { WHATSAPP_LINK, INSTAGRAM_URL } from '../../data/site'

const ITEMS = [
  {
    title: 'WhatsApp',
    text: 'Atendimento rápido e direto.',
    icon: 'whats',
    href: WHATSAPP_LINK,
    external: true
  },
  {
    title: 'Instagram',
    text: 'Acompanhe novidades, peças e ofertas.',
    icon: 'insta',
    href: INSTAGRAM_URL,
    external: true
  },
  {
    title: 'Localização',
    text: 'Endereço em breve.',
    icon: 'pin',
    href: null,
    external: false
  }
]

function Icon({ name }) {
  const base = {
    className: 'contact-icon',
    width: '22',
    height: '22',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }

  if (name === 'whats') {
    return (
      <svg {...base}>
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-4.1-1L3 21l2-5.2a8.4 8.4 0 0 1-1-4.1A8.6 8.6 0 0 1 12.5 3h.5a8.4 8.4 0 0 1 8 8.5Z" />
      </svg>
    )
  }
  if (name === 'insta') {
    return (
      <svg {...base}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return (
    <svg {...base}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function Contato() {
  return (
    <section className="section contact" id="contato">
      <div className="container">
        <h2 className="section-title" data-reveal>
          Fale com o <span>Brechó Inove</span>
        </h2>

        <div className="contact-grid">
          {ITEMS.map((item) => {
            const content = (
              <>
                <div className="contact-icon-wrap">
                  <Icon name={item.icon} />
                </div>
                <div>
                  <h3 className="contact-title">{item.title}</h3>
                  <p className="contact-text">{item.text}</p>
                </div>
              </>
            )

            if (!item.href) {
              return (
                <div className="contact-card" key={item.title} data-reveal>
                  {content}
                </div>
              )
            }

            return (
              <a
                className="contact-card"
                key={item.title}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                data-reveal
              >
                {content}
              </a>
            )
          })}
        </div>

        <div className="contact-actions" data-reveal>
          <a className="btn btn-primary" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            Chamar no WhatsApp
          </a>
          <a className="btn btn-outline" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </section>
  )
}