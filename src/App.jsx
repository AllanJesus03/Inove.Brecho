import { useEffect, useState } from 'react'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Diferenciais from './components/Diferenciais/Diferenciais'
import Sobre from './components/Sobre/Sobre'
import Produtos from './components/Produtos/Produtos'
import CTA from './components/CTA/CTA'
import Contato from './components/Contato/Contato'
import Footer from './components/Footer/Footer'
import AdminScreen from './components/Admin/AdminScreen'
import Catalog from './components/Catalog/Catalog'
import useReveal from './hooks/useReveal'

const ROUTES = {
  admin: '#/admin',
  catalog: '#/produtos'
}

function useRoute() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  if (hash.startsWith(ROUTES.admin)) return 'admin'
  if (hash.startsWith(ROUTES.catalog)) return 'catalog'
  return 'home'
}

export default function App() {
  const route = useRoute()
  const revealRef = useReveal()

  useEffect(() => {
    if (route !== 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [route])

  if (route === 'admin') {
    return <AdminScreen />
  }

  if (route === 'catalog') {
    return (
      <>
        <Header />
        <main>
          <Catalog />
        </main>
        <Footer />
      </>
    )
  }

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
