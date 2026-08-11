import { useEffect, useState } from 'react'

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="6"></circle>
    <path d="m16 16 4 4"></path>
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M5 21c1.5-4 4-6 7-6s5.5 2 7 6"></path>
  </svg>
)

function Navbar({ navigateTo, onSearch, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState('')
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    setMenuOpen(false)
    setActiveDropdown('')
    onSearch(query)
  }

  const go = (event, page = 'home', section = '', options = {}) => {
    if (event) event.preventDefault()
    setMenuOpen(false)
    setActiveDropdown('')
    navigateTo(page, section, { newTab: false, ...options })
  }

  const openDropdown = (name) => setActiveDropdown(name)
  const closeDropdown = () => setActiveDropdown('')
  const toggleDropdown = (name) => setActiveDropdown(activeDropdown === name ? '' : name)

  const legalPdf = (event, href) => {
    event.preventDefault()
    setMenuOpen(false)
    setActiveDropdown('')
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <header className={`site-header professional-header ${scrolled ? 'is-scrolled' : ''}`} id="inicio">
      <nav className="navbar professional-navbar" aria-label="Navegación principal">
        <a className="logo-button" href="#/" onClick={(event) => go(event, 'home', 'inicio')} aria-label="Ir al inicio">LUMA</a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú" aria-expanded={menuOpen}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-center ${menuOpen ? 'open' : ''}`}>
          <div className="nav-menu">
            <div
              className={`nav-item has-dropdown ${activeDropdown === 'products' ? 'is-open' : ''}`}
              onPointerEnter={() => openDropdown('products')}
              onPointerLeave={closeDropdown}
            >
              <button
                type="button"
                className="nav-trigger"
                onPointerDown={() => openDropdown('products')}
                onClick={() => toggleDropdown('products')}
                aria-expanded={activeDropdown === 'products'}
                aria-haspopup="true"
              >
                Productos <span>⌄</span>
              </button>
              <div className="dropdown-menu" role="menu">
                <button type="button" role="menuitem" onClick={(event) => go(event, 'products')}>Catálogo informativo</button>
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'tienda')}>Por preocupación</button>
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'ingredientes')}>Ingredientes clave</button>
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'destacados')}>Activos destacados</button>
              </div>
            </div>

            <div
              className={`nav-item has-dropdown ${activeDropdown === 'routines' ? 'is-open' : ''}`}
              onPointerEnter={() => openDropdown('routines')}
              onPointerLeave={closeDropdown}
            >
              <button
                type="button"
                className="nav-trigger"
                onPointerDown={() => openDropdown('routines')}
                onClick={() => toggleDropdown('routines')}
                aria-expanded={activeDropdown === 'routines'}
                aria-haspopup="true"
              >
                Rutinas <span>⌄</span>
              </button>
              <div className="dropdown-menu" role="menu">
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'rutinas')}>Rutina AM/PM</button>
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'temporada')}>Rutina por temporada</button>
                <button type="button" role="menuitem" onClick={(event) => go(event, 'home', 'contacto')}>Diagnóstico de piel</button>
              </div>
            </div>

            <button className="nav-link" type="button" onClick={(event) => go(event, 'home', 'ingredientes')}>Ingredientes</button>
            <button className="nav-link" type="button" onClick={(event) => go(event, 'blog')}>Blog</button>

            <div
              className={`nav-item has-dropdown ${activeDropdown === 'about' ? 'is-open' : ''}`}
              onPointerEnter={() => openDropdown('about')}
              onPointerLeave={closeDropdown}
            >
              <button
                type="button"
                className="nav-trigger"
                onPointerDown={() => openDropdown('about')}
                onClick={() => toggleDropdown('about')}
                aria-expanded={activeDropdown === 'about'}
                aria-haspopup="true"
              >
                Nosotros <span>⌄</span>
              </button>
              <div className="dropdown-menu" role="menu">
                <button type="button" role="menuitem" onClick={(event) => go(event, 'about')}>Sobre Luma</button>
                <a href="/docs/aviso-privacidad-luma.pdf" target="_blank" rel="noreferrer" role="menuitem" onClick={(event) => legalPdf(event, '/docs/aviso-privacidad-luma.pdf')}>Aviso de privacidad</a>
                <a href="/docs/terminos-condiciones-luma.pdf" target="_blank" rel="noreferrer" role="menuitem" onClick={(event) => legalPdf(event, '/docs/terminos-condiciones-luma.pdf')}>Términos y condiciones</a>
              </div>
            </div>

            <button className="nav-link" type="button" onClick={(event) => go(event, 'home', 'contacto')}>Contacto</button>
          </div>

          <form className="search-box site-search" onSubmit={handleSubmit} role="search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en Luma" aria-label="Buscar en Luma" />
            <button type="submit" aria-label="Buscar"><SearchIcon /></button>
          </form>

          <div className="nav-auth nav-actions">
            {user ? (
              <>
                <a className="login-link with-icon" href="#/dashboard" onClick={(event) => go(event, 'dashboard')}>
                  <UserIcon /> Panel
                </a>
                <button className="logout-link" type="button" onClick={onLogout}>Salir</button>
              </>
            ) : (
              <a className="login-link with-icon" href="#/login" onClick={(event) => go(event, 'auth')}>
                <UserIcon /> Iniciar sesión
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
