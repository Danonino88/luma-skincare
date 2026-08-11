const legalContent = {
  privacy: {
    title: 'Aviso de privacidad',
    intro: 'Página complementaria que informa cómo se recopilan, usan y protegen los datos personales enviados desde el sitio.',
    sections: [
      ['Responsable del sitio', 'Luma Skincare usa la información recibida únicamente para fines de contacto, orientación de rutina y seguimiento de solicitudes.'],
      ['Datos recopilados', 'Nombre, correo electrónico, teléfono opcional, tipo de piel, tema de consulta y mensaje enviado desde el formulario de contacto.'],
      ['Uso de la información', 'Los datos se utilizan para responder dudas, enviar información solicitada y mejorar la experiencia del sitio.'],
      ['Protección de datos', 'La información no se vende a terceros y puede solicitarse su actualización o eliminación mediante el correo de contacto.'],
    ],
  },
  terms: {
    title: 'Términos y condiciones',
    intro: 'Página complementaria legal que establece las condiciones generales de uso del sitio Luma Skincare.',
    sections: [
      ['Uso del sitio', 'El contenido se presenta con fines informativos, educativos y de demostración académica.'],
      ['Información de productos', 'Las descripciones de productos son referencias visuales e informativas. El sitio no funciona como tienda en línea.'],
      ['Formularios', 'El usuario debe ingresar datos reales y suficientes para que la marca pueda responder correctamente.'],
      ['Propiedad intelectual', 'El diseño, textos, estructura y recursos visuales pertenecen al proyecto Luma Skincare.'],
    ],
  },
}

function LegalPage({ type, navigateTo }) {
  const content = legalContent[type]

  return (
    <main className="page-shell legal-page">
      <section className="page-hero compact">
        <p className="eyebrow">Página complementaria</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </section>

      <section className="legal-content">
        {content.sections.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="page-cta">
        <h2>¿Tienes dudas?</h2>
        <button className="btn btn-dark" onClick={() => navigateTo('home', 'contacto')}>Ir a contacto</button>
      </section>
    </main>
  )
}

export default LegalPage
