function SearchPage({ term, results, navigateTo }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigateTo('home', 'inicio')
  }

  return (
    <main className="page-shell search-page">
      <button className="page-back-button" onClick={goBack}>← Regresar</button>
      <section className="page-hero compact">
        <p className="eyebrow">Buscador interno</p>
        <h1>Resultados para “{term}”</h1>
        <p>El buscador revisa productos, categorías, ingredientes y artículos dentro del sitio. Al seleccionar un resultado, se abre la vista o sección correspondiente en la misma pestaña.</p>
      </section>

      <section className="search-results">
        {results.length === 0 && (
          <article className="empty-results">
            <h2>No encontramos resultados</h2>
            <p>Intenta buscar términos como vitamina, acné, hidratación, rutina o SPF.</p>
            <button className="btn btn-gold" onClick={() => navigateTo('home', 'inicio')}>Volver al inicio</button>
          </article>
        )}

        {results.map((item) => (
          <button className="search-result-card" key={`${item.type}-${item.title}`} onClick={() => navigateTo(item.action, item.section)}>
            <span>{item.type}</span>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </button>
        ))}
      </section>
    </main>
  )
}

export default SearchPage
