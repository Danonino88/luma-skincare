const values = [
  { icon: '🌿', title: 'Cruelty-free', description: 'Nunca probado en animales y formulado con ingredientes responsables.' },
  { icon: '🛡', title: 'Sin parabenos', description: 'Fórmulas limpias sin conservadores cuestionados ni fragancias pesadas.' },
  { icon: '✦', title: 'Clínicamente probado', description: 'Productos diseñados con activos conocidos y pruebas de tolerancia.' },
  { icon: '☆', title: 'Ingredientes éticos', description: 'Abastecimiento responsable y comunicación clara con el cliente.' },
]

function WhyLuma() {
  return (
    <section className="why-section" id="nosotros">
      <div className="why-copy">
        <p className="eyebrow">Nuestra filosofía</p>
        <h2>Luz que no compromete nada.</h2>
        <p>
          Creemos que la belleza efectiva y la ética no son opuestas. Cada decisión, desde el ingrediente hasta el empaque, responde a un compromiso con tu piel y el planeta.
        </p>
      </div>

      <div className="value-grid">
        {values.map((value) => (
          <article className="value-card" key={value.title}>
            <span>{value.icon}</span>
            <strong>{value.title}</strong>
            <p>{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WhyLuma
