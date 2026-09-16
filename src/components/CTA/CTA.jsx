import { WHATSAPP_LINK } from '../../data/site'

export default function CTA() {
  return (
    <section className="cta">
      <div className="container cta-inner" data-reveal>
        <h2 className="cta-title">Encontrou seu próximo look?</h2>
        <p className="cta-text">Confira nossas peças disponíveis e escolha a sua.</p>
        <div className="cta-actions">
          <a className="btn btn-white" href="#produtos">
            Ver produtos
          </a>
          <a className="btn cta-whats" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}