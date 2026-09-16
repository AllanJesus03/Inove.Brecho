import SmartImage from '../SmartImage/SmartImage'

export default function Hero() {
  return (
    <section className="hero section" id="inicio">
      <div className="container hero-grid" data-reveal>
        <div className="hero-copy">
          <h1 className="hero-title">
            Seu estilo. Seu momento.
            <br />
            <span>Seu Inove.</span>
          </h1>
          <p className="hero-sub">
            Moda, estilo e boas escolhas em peças selecionadas para você.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#produtos">
              Ver produtos
            </a>
            <a className="btn btn-outline" href="#sobre">
              Conheça o Brechó
            </a>
          </div>
        </div>

        <div className="hero-media">
          <SmartImage
            className="hero-img"
            src="/images/hero.svg"
            alt="Peças de moda selecionadas do Brechó Inove"
            loading="eager"
            label="Moda · Estilo"
          />
        </div>
      </div>
    </section>
  )
}