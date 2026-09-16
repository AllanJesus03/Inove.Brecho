import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Diferenciais from './components/Diferenciais/Diferenciais'
import Sobre from './components/Sobre/Sobre'
import Produtos from './components/Produtos/Produtos'
import CTA from './components/CTA/CTA'
import Contato from './components/Contato/Contato'
import Footer from './components/Footer/Footer'
import useReveal from './hooks/useReveal'

export default function App() {
  const revealRef = useReveal()

  return (
    <div ref={revealRef}>
      <Header />
      <main>
        <Hero />
        <Diferenciais />
        <Sobre />
        <Produtos />
        <CTA />
        <Contato />
      </main>
      <Footer />
    </div>
  )
}