function Hero({ navigateTo }) {
  return (
    <section className="hero section-shell" id="hero">
      <div className="hero-copy">
        <p className="eyebrow">Skincare consciente · Rutinas reales</p>
        <h1>Cuida tu piel con una rutina clara, simple y efectiva.</h1>
        <p className="hero-description">
          Luma reúne productos, ingredientes y guías de cuidado facial para ayudarte a elegir una rutina que sí puedas mantener todos los días.
        </p>

        <div className="hero-actions">
          <button className="btn btn-dark" onClick={() => navigateTo('home', 'rutinas')}>Descubre tu rutina</button>
          <button className="btn btn-outline" onClick={() => navigateTo('products')}>Ver guía de productos</button>
        </div>

        <div className="hero-stats" aria-label="Datos principales de Luma">
          <div><strong>4,200+</strong><span>usuarios guiados</span></div>
          <div><strong>98%</strong><span>satisfacción</span></div>
          <div><strong>4.9</strong><span>valoración</span></div>
        </div>
      </div>

      <div className="hero-editorial" aria-label="Imagen editorial de skincare">
        <img src="/images/hero-gua-sha.jpg" alt="Rutina facial con herramienta gua sha" />
        <button className="hero-floating-card" onClick={() => navigateTo('home', 'rutinas')}>
          <span>Guía destacada</span>
          <strong>Masaje facial + hidratación</strong>
        </button>
      </div>
    </section>
  )
}

export default Hero
