import { stats } from '../data/siteData'

function Analytics() {
  return (
    <section className="analytics-section" id="estadisticas">
      <div className="analytics-card">
        <div className="section-header">
          <p className="eyebrow">Datos estadísticos</p>
          <h2>Medimos para mejorar la experiencia</h2>
          <p>Esta sección representa las métricas que el sitio puede conectar con herramientas como Google Analytics o un panel propio.</p>
        </div>

        <div className="stats-grid">
          {stats.map((item, index) => (
            <article className="stat-card" key={item.label}>
              <span>{item.change}</span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
              <div className="stat-bar"><i style={{ width: `${62 + index * 8}%` }}></i></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Analytics
