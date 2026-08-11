import { posts } from '../data/siteData'

function Blog({ navigateTo }) {
  return (
    <section className="blog-section" id="blog">
      <div className="blog-header">
        <div>
          <p className="eyebrow">Diario Luma</p>
          <h2>Saber para brillar mejor</h2>
        </div>
        <button className="text-button" onClick={() => navigateTo('blog')}>Ver todo</button>
      </div>

      <div className="blog-grid">
        {posts.map((post) => (
          <button className="blog-card" key={post.id} onClick={() => navigateTo('blog')} aria-label={`Abrir artículo ${post.title}`}>
            <div className="blog-image"><img src={post.image} alt={`Imagen del artículo ${post.title}`} /><span>{post.category}</span></div>
            <div className="blog-meta">
              <span>{post.category}</span>
              <small>{post.date} · {post.read}</small>
            </div>
            <strong>{post.title}</strong>
            <p>{post.summary}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default Blog
