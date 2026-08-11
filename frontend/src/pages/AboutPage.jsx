function AboutPage({ navigateTo }) {
  return (
    <main className="page-shell">
      <section className="page-hero editorial-page">
        <div>
          <p className="eyebrow">Sobre Luma</p>
          <h1>Skincare consciente, claro y fácil de seguir.</h1>
          <p>Luma es una marca informativa enfocada en rutinas simples, activos confiables y una experiencia digital profesional.</p>
          <button className="btn btn-gold" onClick={() => navigateTo('home', 'contacto')}>Contactar</button>
        </div>
        <img src="/images/texture-flatlay.jpg" alt="Texturas de productos skincare" />
      </section>

      <section className="about-columns">
        <article>
          <h2>Misión</h2>
          <p>Ayudar a las personas a construir una rutina sencilla, efectiva y visualmente clara.</p>
        </article>
        <article>
          <h2>Visión</h2>
          <p>Ser una marca confiable para quienes buscan productos honestos y fáciles de usar.</p>
        </article>
        <article>
          <h2>Valores</h2>
          <p>Claridad, ética, ciencia accesible, sostenibilidad y cercanía con el cliente.</p>
        </article>
      </section>
    </main>
  )
}

export default AboutPage
