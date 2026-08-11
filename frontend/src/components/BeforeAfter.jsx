function BeforeAfter() {
  return (
    <section className="before-after-section" id="resultados">
      <div className="section-header centered-small">
        <p className="eyebrow">Resultados y hábitos</p>
        <h2>Pequeños pasos, piel más constante</h2>
        <p>El objetivo de Luma es ayudarte a crear una rutina clara, medible y fácil de sostener.</p>
      </div>

      <div className="before-after-grid">
        <button className="result-card before">
          <img src="/images/cleanser-face.jpg" alt="Persona realizando limpieza facial" />
          <span>Inicio — Limpieza y diagnóstico</span>
        </button>
        <button className="result-card after">
          <img src="/images/sheet-mask-model.jpg" alt="Persona usando mascarilla facial hidratante" />
          <em>Rutina constante</em>
          <span>Seguimiento — Hidratación y protección</span>
        </button>
      </div>
    </section>
  )
}

export default BeforeAfter
