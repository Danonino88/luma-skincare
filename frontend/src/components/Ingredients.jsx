import { useState } from 'react'
import { ingredients } from '../data/siteData'

function Ingredients({ navigateTo }) {
  const [selected, setSelected] = useState('')

  return (
    <section className="ingredients-section" id="ingredientes">
      <div className="section-header centered-small">
        <p className="eyebrow">Ingredientes estrella</p>
        <h2>La ciencia detrás de la luz</h2>
        <p>Activos claros, fáciles de entender y seleccionados por el beneficio que aportan a tu piel.</p>
      </div>

      <div className="ingredient-grid">
        {ingredients.map((ingredient) => (
          <article
            className={`ingredient-card ${selected === ingredient.name ? 'is-selected' : ''}`}
            key={ingredient.name}
            onMouseEnter={() => setSelected(ingredient.name)}
            onFocus={() => setSelected(ingredient.name)}
            onMouseLeave={() => setSelected('')}
            onBlur={() => setSelected('')}
          >
            <button className={`ingredient-media tone-${ingredient.tone}`} onClick={() => navigateTo('products')}>
              <img src={ingredient.image} alt={`Imagen ilustrativa de ${ingredient.name}`} />
              <span>{ingredient.code}</span>
            </button>
            <div className="ingredient-copy">
              <small>{ingredient.subtitle}</small>
              <h3>{ingredient.name}</h3>
              <p>{ingredient.description}</p>
              <button className="text-button" onClick={() => navigateTo('products')}>Ver productos</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Ingredients
