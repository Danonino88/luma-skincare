import { products } from '../data/siteData'

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

function ProductsPage({ navigateTo }) {
  return (
    <main className="page-shell">
      <BackButton navigateTo={navigateTo} />
      <section className="page-hero editorial-page">
        <div>
          <p className="eyebrow">Catálogo Luma</p>
          <h1>Productos pensados para una rutina clara.</h1>
          <p>Explora opciones informativas por objetivo de piel. Esta vista funciona como guía de producto, no como tienda en línea.</p>
        </div>
        <img src="/images/product-set.jpg" alt="Selección de productos skincare" />
      </section>

      <section className="product-grid-page">
        {products.map((product) => (
          <article className="product-card-page professional-product" key={product.id}>
            <div className="product-image"><img src={product.image} alt={`Imagen de ${product.name}`} /><span>{product.tag}</span></div>
            <div>
              <small>{product.category}</small>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <ul>
                {product.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
              <div className="product-card-footer">
                <strong>{product.goal}</strong>
                <button className="btn btn-dark" onClick={() => navigateTo('home', 'contacto')}>Solicitar recomendación</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="page-cta">
        <h2>¿Quieres una rutina completa?</h2>
        <button className="btn btn-gold" onClick={() => navigateTo('home', 'rutinas')}>Ver rutina AM/PM</button>
      </section>
    </main>
  )
}

export default ProductsPage
