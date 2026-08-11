import { posts } from '../data/siteData'

function BackButton({ navigateTo }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigateTo('home', 'inicio')
  }

  return <button className="page-back-button" onClick={goBack}>← Regresar</button>
}

function BlogPage({ navigateTo }) {
  return (
    <main className="page-shell">
      <BackButton navigateTo={navigateTo} />
      <section className="page-hero editorial-page">
        <div>
          <p className="eyebrow">Diario Luma</p>
          <h1>Guías para cuidar mejor tu piel.</h1>
          <p>Contenido editorial con consejos prácticos, ingredientes y hábitos para construir una rutina sostenible.</p>
        </div>
        <img src="/images/skin-tips.jpg" alt="Consejos de skincare" />
      </section>

      <section className="article-list-page">
        {posts.map((post) => (
          <article className="article-row" key={post.id}>
            <div className="article-thumb"><img src={post.image} alt={`Imagen del artículo ${post.title}`} /><span>{post.category}</span></div>
            <div>
              <small>{post.date} · {post.read}</small>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <button className="text-button" onClick={() => navigateTo('home', 'blog')}>Leer artículo</button>
            </div>
          </article>
        ))}
      </section>

      <section className="page-cta">
        <h2>Explora los ingredientes mencionados</h2>
        <button className="btn btn-outline" onClick={() => navigateTo('home', 'ingredientes')}>Ver ingredientes</button>
      </section>
    </main>
  )
}

export default BlogPage
