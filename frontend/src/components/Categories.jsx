import { useState } from 'react'
import { categories } from '../data/siteData'

function Categories({ navigateTo }) {
  const [active, setActive] = useState('')

  return (
    <section className="section-block" id="tienda">
      <div className="section-header split-header">
        <div>
          <p className="eyebrow">Por preocupación</p>
          <h2>Encuentra tu solución</h2>
        </div>
        <p>Elige la necesidad principal de tu piel y navega directo hacia productos pensados para ese objetivo.</p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-card ${active === category.name ? 'is-active' : ''}`}
            onMouseEnter={() => setActive(category.name)}
            onFocus={() => setActive(category.name)}
            onMouseLeave={() => setActive('')}
            onBlur={() => setActive('')}
            onClick={() => navigateTo('products')}
          >
            <span className="category-icon">{category.icon}</span>
            <strong>{category.name}</strong>
            <small>{category.description}</small>
            <em>Explorar →</em>
          </button>
        ))}
      </div>

      <div className="category-banner">
        <p>¿No sabes por dónde empezar?</p>
        <button className="btn btn-gold" onClick={() => navigateTo('home', 'rutinas')}>Armar rutina guiada</button>
      </div>
    </section>
  )
}

export default Categories
