import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Categories from './components/Categories'
import Ingredients from './components/Ingredients'
import RoutineAMPM from './components/RoutineAMPM'
import BeforeAfter from './components/BeforeAfter'
import Reviews from './components/Reviews'
import WhyLuma from './components/WhyLuma'
import Blog from './components/Blog'
import Contact from './components/Contact'
import Analytics from './components/Analytics'
import Footer from './components/Footer'
import CalendarEventBanner from './components/CalendarEventBanner'
import SeasonalUpdate from './components/SeasonalUpdate'
import PointerHighlight from './components/PointerHighlight'
import SearchPage from './pages/SearchPage'
import ProductsPage from './pages/ProductsPage'
import BlogPage from './pages/BlogPage'
import AboutPage from './pages/AboutPage'
import LegalPage from './pages/LegalPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import { apiRequest, clearStoredSession, getStoredSession, saveStoredSession } from './api'
import { categories, ingredients, posts, products } from './data/siteData'

const pageRoutes = {
  home: '',
  products: 'productos',
  blog: 'blog',
  about: 'nosotros',
  privacy: 'privacidad',
  terms: 'terminos',
  search: 'buscar',
  auth: 'login',
  dashboard: 'dashboard',
}

const routePages = Object.fromEntries(Object.entries(pageRoutes).map(([page, route]) => [route, page]))

function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const [route = '', query = ''] = hash.split('?')
  const page = routePages[route] || 'home'
  const params = new URLSearchParams(query)
  return { page, term: params.get('term') || '' }
}

function routeUrl(page, term = '') {
  const route = pageRoutes[page] || ''
  const query = page === 'search' && term ? `?term=${encodeURIComponent(term)}` : ''
  return `${window.location.origin}${window.location.pathname}#/${route}${query}`
}

function App() {
  const firstRoute = typeof window !== 'undefined' ? readRoute() : { page: 'home', term: '' }
  const [notice, setNotice] = useState('')
  const [page, setPage] = useState(firstRoute.page)
  const [searchTerm, setSearchTerm] = useState(firstRoute.term)
  const [session, setSession] = useState(() => getStoredSession())

  useEffect(() => {
    const handleHash = () => {
      const route = readRoute()
      setPage(route.page)
      if (route.term) setSearchTerm(route.term)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  useEffect(() => {
    let ignore = false

    async function validateSession() {
      const stored = getStoredSession()
      if (!stored?.token) return

      try {
        const data = await apiRequest('/api/auth/me', { token: stored.token })
        if (!ignore) setSession({ token: stored.token, user: data.user })
      } catch {
        clearStoredSession()
        if (!ignore) setSession(null)
      }
    }

    validateSession()
    return () => { ignore = true }
  }, [])

  const showNotice = (message) => {
    setNotice(message)
    window.clearTimeout(window.lumaNoticeTimer)
    window.lumaNoticeTimer = window.setTimeout(() => setNotice(''), 3200)
  }

  const scrollToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAuthenticated = (nextSession) => {
    setSession(nextSession)
  }

  const handleUserUpdate = (updatedUser) => {
    setSession((current) => {
      const nextSession = { ...(current || {}), user: updatedUser, token: current?.token || getStoredSession()?.token }
      if (nextSession.token) saveStoredSession(nextSession)
      return nextSession
    })
  }

  const handleLogout = async () => {
    try {
      if (session?.token) {
        await apiRequest('/api/auth/logout', { method: 'POST', token: session.token })
      }
    } catch {
    }

    clearStoredSession()
    setSession(null)
    window.location.hash = '#/'
    setPage('home')
    showNotice('Sesión cerrada correctamente.')
  }

  const navigateTo = (nextPage = 'home', sectionId = '', options = {}) => {
    const openInNewTab = options.newTab ?? false

    if (nextPage === 'home') {
      window.location.hash = '#/'
      setPage('home')
      if (sectionId) window.setTimeout(() => scrollToSection(sectionId), 80)
      return
    }

    const url = routeUrl(nextPage, options.term || '')
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    window.location.hash = `#/${pageRoutes[nextPage] || ''}${nextPage === 'search' && options.term ? `?term=${encodeURIComponent(options.term)}` : ''}`
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (term) => {
    const cleanTerm = term.trim()
    if (!cleanTerm) {
      showNotice('Escribe una palabra para buscar dentro del sitio.')
      return
    }
    setSearchTerm(cleanTerm)
    navigateTo('search', '', { term: cleanTerm, newTab: false })
  }

  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const items = [
      ...products.map((item) => ({ type: 'Producto', title: item.name, text: item.description, action: 'products' })),
      ...categories.map((item) => ({ type: 'Categoría', title: item.name, text: item.description, action: 'home', section: 'tienda' })),
      ...ingredients.map((item) => ({ type: 'Ingrediente', title: item.name, text: item.description, action: 'home', section: 'ingredientes' })),
      ...posts.map((item) => ({ type: 'Blog', title: item.title, text: item.summary, action: 'blog' })),
    ]
    return items.filter((item) => `${item.type} ${item.title} ${item.text}`.toLowerCase().includes(term))
  }, [searchTerm])

  const isHome = page === 'home'
  const isAuth = page === 'auth'
  const isDashboard = page === 'dashboard'
  const hidePublicChrome = isAuth || isDashboard

  return (
    <>
      {!hidePublicChrome && <Navbar navigateTo={navigateTo} onSearch={handleSearch} showNotice={showNotice} user={session?.user} onLogout={handleLogout} />}
      {isHome && <CalendarEventBanner navigateTo={navigateTo} showNotice={showNotice} />}
      {isHome && (
        <main>
          <Hero navigateTo={navigateTo} showNotice={showNotice} />
          <Categories navigateTo={navigateTo} showNotice={showNotice} />
          <Ingredients navigateTo={navigateTo} showNotice={showNotice} />
          <PointerHighlight showNotice={showNotice} />
          <SeasonalUpdate navigateTo={navigateTo} showNotice={showNotice} />
          <RoutineAMPM navigateTo={navigateTo} showNotice={showNotice} />
          <BeforeAfter showNotice={showNotice} />
          <Reviews />
          <WhyLuma />
          <Blog navigateTo={navigateTo} showNotice={showNotice} />
          <Analytics />
          <Contact showNotice={showNotice} />
        </main>
      )}
      {page === 'products' && <ProductsPage navigateTo={navigateTo} showNotice={showNotice} />}
      {page === 'blog' && <BlogPage navigateTo={navigateTo} showNotice={showNotice} />}
      {page === 'about' && <AboutPage navigateTo={navigateTo} />}
      {page === 'privacy' && <LegalPage type="privacy" navigateTo={navigateTo} />}
      {page === 'terms' && <LegalPage type="terms" navigateTo={navigateTo} />}
      {page === 'search' && <SearchPage term={searchTerm} results={searchResults} navigateTo={navigateTo} />}
      {page === 'auth' && <AuthPage onAuthenticated={handleAuthenticated} showNotice={showNotice} navigateTo={navigateTo} />}
      {page === 'dashboard' && <DashboardPage user={session?.user} navigateTo={navigateTo} showNotice={showNotice} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />}
      {!hidePublicChrome && <Footer navigateTo={navigateTo} showNotice={showNotice} />}
      {notice && <div className="notice" role="status">{notice}</div>}
    </>
  )
}

export default App
