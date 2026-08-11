import { useEffect, useMemo, useState } from 'react'
import { seasonalUpdates } from '../data/siteData'

function getCurrentSeasonId(date = new Date()) {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return 'primavera'
  if (month >= 6 && month <= 8) return 'verano'
  if (month >= 9 && month <= 11) return 'otono'
  return 'invierno'
}

function SeasonalUpdate({ navigateTo }) {
  const currentSeasonId = useMemo(() => getCurrentSeasonId(), [])
  const [selectedId, setSelectedId] = useState(currentSeasonId)
  const selectedSeason = seasonalUpdates.find((season) => season.id === selectedId) || seasonalUpdates[0]

  useEffect(() => {
    return () => {
      document.documentElement.dataset.seasonUpdate = 'default'
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.seasonUpdate = selectedSeason.theme
  }, [selectedSeason])

  const applySeason = (season) => {
    setSelectedId(season.id)
    window.dispatchEvent(new CustomEvent('luma-season-update', { detail: season }))
  }

  return (
    <section className={`seasonal-update ${selectedSeason.theme} season-${selectedSeason.id}`} id="temporada">
      <div className="seasonal-copy">
        <p className="eyebrow">Temporada Luma</p>
        <h2>{selectedSeason.title}</h2>
        <p>{selectedSeason.description}</p>
        <div className="seasonal-banner-text">{selectedSeason.banner}</div>
        <div className="seasonal-actions">
          <button className="btn btn-dark" type="button" onClick={() => applySeason(selectedSeason)}>Aplicar recomendación</button>
          <button className="btn btn-outline" type="button" onClick={() => navigateTo('home', 'rutinas')}>Ver rutina relacionada</button>
        </div>
      </div>

      <div className="seasonal-panel">
        <div className="seasonal-panel-head">
          <span>Temporada activa</span>
          <strong>{selectedSeason.season}</strong>
          <small>{selectedSeason.months}</small>
        </div>

        <div className="seasonal-routine">
          {selectedSeason.routine.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>

        <div className="seasonal-switcher" aria-label="Probar actualización por temporada">
          {seasonalUpdates.map((season) => (
            <button
              key={season.id}
              type="button"
              className={selectedId === season.id ? 'active' : ''}
              onClick={() => applySeason(season)}
            >
              {season.season}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SeasonalUpdate
