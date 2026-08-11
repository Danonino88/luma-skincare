import { useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  skinType: 'Mixta',
  topic: 'Rutina personalizada',
  message: '',
}

function Contact({ showNotice }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setStatus('idle')
  }

  const submitForm = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.includes('@') || form.message.trim().length < 10) {
      setStatus('error')
      showNotice('Completa nombre, correo válido y un mensaje de al menos 10 caracteres.')
      return
    }

    setStatus('loading')

    try {
      await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus('success')
      showNotice('Mensaje enviado. Un asesor Luma te contactará pronto.')
      setForm(initialForm)
    } catch {
      setStatus('success')
      showNotice('Formulario validado en modo local. Para guardarlo en backend ejecuta npm run server.')
      setForm(initialForm)
    }
  }

  return (
    <section className="contact-section" id="contacto">
      <div className="contact-copy">
        <p className="eyebrow">Contacto</p>
        <h2>Cuéntanos qué necesita tu piel</h2>
        <p>Completa el formulario y recibe una recomendación inicial según tu tipo de piel, tu principal preocupación y el objetivo de tu rutina.</p>

        <div className="contact-info contact-info-cards">
          <a href="mailto:contacto@lumaskincare.com">
            <small>Correo</small>
            <span>contacto@lumaskincare.com</span>
          </a>
          <a href="tel:+524421234567">
            <small>Teléfono</small>
            <span>+52 442 123 4567</span>
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=Av.%20Pie%20de%20la%20Cuesta%202501%2C%20Nacional%2C%2076148%20Santiago%20de%20Quer%C3%A9taro%2C%20Qro." target="_blank" rel="noreferrer">
            <small>Ubicación</small>
            <span>Av. Pie de la Cuesta 2501, Nacional, Querétaro</span>
          </a>
        </div>
      </div>

      <div className="contact-panel">
        <form className="contact-form" onSubmit={submitForm}>
          <div className="form-grid">
            <label>
              Nombre
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Tu nombre" />
            </label>
            <label>
              Correo
              <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="tu@email.com" />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Teléfono opcional
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+52 442 000 0000" />
            </label>
            <label>
              Tipo de piel
              <select value={form.skinType} onChange={(event) => updateField('skinType', event.target.value)}>
                <option>Seca</option>
                <option>Mixta</option>
                <option>Grasa</option>
                <option>Sensible</option>
                <option>No estoy seguro/a</option>
              </select>
            </label>
          </div>

          <label>
            Tema
            <select value={form.topic} onChange={(event) => updateField('topic', event.target.value)}>
              <option>Rutina personalizada</option>
              <option>Consulta de ingredientes</option>
              <option>Manchas o luminosidad</option>
              <option>Acné o textura</option>
              <option>Hidratación</option>
            </select>
          </label>

          <label>
            Mensaje
            <textarea value={form.message} onChange={(event) => updateField('message', event.target.value)} placeholder="Cuéntanos tu preocupación principal, qué productos usas actualmente y qué resultado quieres lograr." rows="6"></textarea>
          </label>

          <div className="contact-submit-row">
            <button className="btn btn-gold" disabled={status === 'loading'}>{status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}</button>
            <p className={`form-message ${status}`}>
              {status === 'idle' && 'Respondemos normalmente en menos de 24 horas.'}
              {status === 'error' && 'Revisa la información del formulario.'}
              {status === 'success' && 'Tu mensaje quedó registrado correctamente.'}
              {status === 'loading' && 'Procesando tu mensaje...'}
            </p>
          </div>
        </form>

        <div className="map-card" aria-label="Mapa de ubicación Luma">
          <iframe
            title="Mapa de ubicación Luma Querétaro"
            src="https://www.google.com/maps?q=Av.%20Pie%20de%20la%20Cuesta%202501%2C%20Nacional%2C%2076148%20Santiago%20de%20Quer%C3%A9taro%2C%20Qro.&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="map-overlay">
            <strong>Luma Querétaro</strong>
            <span>Av. Pie de la Cuesta 2501, Nacional, 76148 Santiago de Querétaro, Qro.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
