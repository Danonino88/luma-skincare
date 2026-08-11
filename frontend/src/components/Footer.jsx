import { socials } from '../data/siteData'

const SocialIcon = ({ name }) => {
  if (name === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5"></rect>
        <circle cx="12" cy="12" r="4"></circle>
        <circle cx="17" cy="7" r="1"></circle>
      </svg>
    )
  }

  if (name === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 4c.4 3 2.2 4.9 5 5.2v3.1c-1.8.1-3.4-.5-5-1.6v5.1c0 3.4-2.1 5.7-5.2 5.7-2.7 0-4.8-1.9-4.8-4.6 0-2.9 2.3-4.9 5.4-4.7v3.2c-1.3-.2-2.2.5-2.2 1.5 0 .9.7 1.5 1.6 1.5 1.1 0 1.8-.7 1.8-2.3V4h3.4z"></path>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.2 3.5c-4.7 0-7.2 3.1-7.2 6.4 0 2 1 3.8 2.6 4.5.3.1.5 0 .6-.3l.2-.9c.1-.3.1-.4-.1-.7-.5-.6-.8-1.3-.8-2.3 0-2.8 2.1-5.1 5.5-5.1 3 0 4.8 1.8 4.8 4.4 0 3.3-1.6 5.6-3.6 5.6-1.1 0-1.9-.9-1.6-2l.8-3.1c.2-1-.2-1.9-1.2-1.9-1 0-1.8 1-1.8 2.4 0 .9.3 1.5.3 1.5l-1.2 5.2c-.3 1.2-.2 2.9-.1 3.9 0 .3.4.4.5.1.5-.8 1.2-2.2 1.5-3.4l.5-2.1c.5.9 1.6 1.7 2.9 1.7 3.8 0 6.5-3.4 6.5-7.8 0-3.6-3-6.8-7.6-6.8z"></path>
    </svg>
  )
}

function Footer({ navigateTo }) {
  const go = (event, page = 'home', section = '') => {
    if (event) event.preventDefault()
    navigateTo(page, section)
  }

  const openPdf = (event, href) => {
    event.preventDefault()
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="footer" id="footer">
      <div className="footer-main footer-main-simple">
        <div className="footer-brand">
          <a className="footer-logo" href="#inicio" onClick={(event) => go(event, 'home', 'inicio')}>LUMA</a>
          <p>Luz para la piel. Skincare consciente desde 2021.</p>
          <div className="footer-contact-mini">
            <a href="mailto:contacto@lumaskincare.com">contacto@lumaskincare.com</a>
            <a href="tel:+524421234567">+52 442 123 4567</a>
            <a href="https://www.google.com/maps/search/?api=1&query=Av.%20Pie%20de%20la%20Cuesta%202501%2C%20Nacional%2C%2076148%20Santiago%20de%20Quer%C3%A9taro%2C%20Qro." target="_blank" rel="noreferrer">Ver ubicación</a>
          </div>
        </div>

        <div className="footer-legal-card">
          <span>Información legal</span>
          <a href="/docs/aviso-privacidad-luma.pdf" target="_blank" rel="noreferrer" onClick={(event) => openPdf(event, '/docs/aviso-privacidad-luma.pdf')}>Aviso de privacidad</a>
          <a href="/docs/terminos-condiciones-luma.pdf" target="_blank" rel="noreferrer" onClick={(event) => openPdf(event, '/docs/terminos-condiciones-luma.pdf')}>Términos y condiciones</a>
        </div>

        <div className="footer-social-col">
          <strong>Redes sociales</strong>
          <div className="footer-socials" aria-label="Redes sociales">
            {socials.map((social) => (
              <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name}>
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom footer-bottom-simple">
        <span>© 2026 Luma Skincare. Todos los derechos reservados.</span>
        <div>
          <a href="/docs/aviso-privacidad-luma.pdf" target="_blank" rel="noreferrer" onClick={(event) => openPdf(event, '/docs/aviso-privacidad-luma.pdf')}>Privacidad</a>
          <a href="/docs/terminos-condiciones-luma.pdf" target="_blank" rel="noreferrer" onClick={(event) => openPdf(event, '/docs/terminos-condiciones-luma.pdf')}>Términos</a>
          <a href="mailto:contacto@lumaskincare.com">Contacto</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
