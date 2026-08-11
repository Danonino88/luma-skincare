import { useState } from 'react'
import { routines } from '../data/siteData'

function RoutineAMPM({ navigateTo }) {
  const [tab, setTab] = useState('am')
  const routine = routines[tab]

  return (
    <section className="routine-section" id="rutinas">
      <div className="routine-visual">
        <div className="routine-product-card">
          <span>{tab === 'am' ? '☀' : '☾'}</span>
          <strong>{tab === 'am' ? 'Rutina de mañana' : 'Rutina de noche'}</strong>
          <p>{tab === 'am' ? 'Protege, hidrata e ilumina.' : 'Limpia, repara y nutre.'}</p>
        </div>
      </div>

      <div className="routine-content">
        <p className="eyebrow">Tu ritual diario</p>
        <h2>Paso a paso hacia la luz</h2>
        <p>Cambia entre mañana y noche para revisar cada rutina sin recargar la página.</p>

        <div className="tab-group" role="tablist" aria-label="Rutina AM y PM">
          <button className={tab === 'am' ? 'active' : ''} onClick={() => setTab('am')}>☀ Mañana</button>
          <button className={tab === 'pm' ? 'active' : ''} onClick={() => setTab('pm')}>☾ Noche</button>
        </div>

        <div className="routine-list">
          {routine.map((item) => (
            <div className="routine-step" key={item.step}>
              <span>{item.step}</span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-dark" onClick={() => navigateTo('products')}>
          Ver mis productos
        </button>
      </div>
    </section>
  )
}

export default RoutineAMPM
