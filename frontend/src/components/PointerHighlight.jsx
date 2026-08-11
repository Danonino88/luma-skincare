import { useEffect, useRef, useState } from 'react'
import { highlightContents } from '../data/siteData'

function PointerHighlight() {
  const sectionRef = useRef(null)
  const [activeContent, setActiveContent] = useState(highlightContents[0])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const cards = Array.from(section.querySelectorAll('.js-pointer-highlight'))

    const highlightCard = (event) => {
      const card = event.currentTarget
      const selected = highlightContents.find((item) => item.id === card.dataset.highlightId)
      cards.forEach((item) => item.classList.remove('is-pointer-highlighted'))
      card.classList.add('is-pointer-highlighted')
      if (selected) setActiveContent(selected)
    }

    const clearCard = (event) => {
      event.currentTarget.classList.remove('is-pointer-highlighted')
    }

    cards.forEach((card) => {
      card.addEventListener('mouseover', highlightCard)
      card.addEventListener('mouseout', clearCard)
      card.addEventListener('focus', highlightCard)
      card.addEventListener('blur', clearCard)
      card.addEventListener('click', highlightCard)
    })

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mouseover', highlightCard)
        card.removeEventListener('mouseout', clearCard)
        card.removeEventListener('focus', highlightCard)
        card.removeEventListener('blur', clearCard)
        card.removeEventListener('click', highlightCard)
      })
    }
  }, [])

  return (
    <section className="pointer-highlight-section" id="destacados" ref={sectionRef}>
      <div className="section-header split-header">
        <div>
          <p className="eyebrow">Activos destacados</p>
          <h2>Explora ingredientes clave</h2>
        </div>
        <p>Pasa el mouse sobre un ingrediente para ver su beneficio principal y encontrar la opción más adecuada para tu rutina.</p>
      </div>

      <div className="pointer-highlight-layout">
        <div className="pointer-card-grid">
          {highlightContents.map((item) => (
            <button
              key={item.id}
              type="button"
              className="pointer-card js-pointer-highlight"
              data-highlight-id={item.id}
            >
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.label}</small>
            </button>
          ))}
        </div>

        <article className="pointer-detail" aria-live="polite">
          <span>Guía de ingrediente</span>
          <h3>{activeContent.title}</h3>
          <p>{activeContent.description}</p>
          <em>{activeContent.label}</em>
        </article>
      </div>
    </section>
  )
}

export default PointerHighlight
