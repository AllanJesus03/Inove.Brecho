import SmartImage from '../SmartImage/SmartImage'

export default function Sobre() {
  return (
    <section className="section sobre" id="sobre">
      <div className="container sobre-grid">
        <div className="sobre-copy" data-reveal>
          <h2 className="section-title left">
            Conheça o<br /> <span>Brechó Inove</span>
          </h2>
          <p className="sobre-text">
            O Brechó Inove nasceu para tornar a moda mais acessível, consciente e cheia de
            personalidade. Selecionamos peças com estilo e boas oportunidades para quem gosta de se
            vestir bem e fazer escolhas inteligentes.
          </p>
          <a className="btn btn-primary" href="#produtos">
            Ver peças disponíveis
          </a>
        </div>

        <div className="sobre-media" data-reveal>
          <SmartImage
            className="sobre-img"
            src="/images/sobre.svg"
            alt="Ambiente do Brechó Inove com peças de moda selecionadas"
            loading="lazy"
            label="Brechó Inove"
          />
        </div>
      </div>
    </section>
  )
}