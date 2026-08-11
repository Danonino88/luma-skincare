import { reviews } from '../data/siteData'

function Reviews() {
  return (
    <section className="reviews-section" id="reviews">
      <div className="section-header split-header">
        <div>
          <p className="eyebrow">Testimonios</p>
          <h2>Lo que dicen quienes brillan</h2>
        </div>
        <p>Opiniones de clientes que usan Luma como parte de su rutina diaria.</p>
      </div>

      <div className="review-grid">
        {reviews.map((review) => (
          <article className="review-card" key={review.name}>
            <div className="stars">★★★★★</div>
            <p>“{review.text}”</p>
            <small>{review.product}</small>
            <div className="review-author">
              <div>{review.name.charAt(0)}</div>
              <span><strong>{review.name}</strong>{review.city}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Reviews
