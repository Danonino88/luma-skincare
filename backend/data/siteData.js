export const products = [
  {
    id: 1,
    name: 'Luma Water Cleanser',
    category: 'Limpieza',
    goal: 'Limpieza suave',
    tag: 'Uso diario',
    image: '/images/product-cleanser-texture.jpg',
    description: 'Limpiador facial de textura acuosa que retira impurezas sin dejar sensación tirante.',
    ingredients: ['Agua mineral', 'Glicerina', 'Centella asiática'],
  },
  {
    id: 2,
    name: 'Sérum Vitamina C 20%',
    category: 'Luminosidad',
    goal: 'Brillo uniforme',
    tag: 'Nuevo',
    image: '/images/glycolic-serum.jpg',
    description: 'Tratamiento antioxidante para piel apagada, manchas visibles y exposición diaria.',
    ingredients: ['Vitamina C', 'Ácido ferúlico', 'Vitamina E'],
  },
  {
    id: 3,
    name: 'HydraCalm Sheet Mask',
    category: 'Hidratación',
    goal: 'Recuperación de barrera',
    tag: 'Calmante',
    image: '/images/hydra-mask.jpg',
    description: 'Mascarilla hidratante de uso único para calmar, refrescar y recuperar la piel.',
    ingredients: ['Ácido hialurónico', 'Pantenol', 'Aloe vera'],
  },
  {
    id: 4,
    name: 'Kit Rutina Glow',
    category: 'Rutinas',
    goal: 'Rutina completa',
    tag: 'Recomendado',
    image: '/images/product-set.jpg',
    description: 'Selección esencial para limpiar, hidratar, tratar y proteger la piel todos los días.',
    ingredients: ['Limpiador', 'Sérum', 'Crema', 'SPF'],
  },
]

export const categories = [
  {
    icon: '✦',
    name: 'Acné',
    description: 'Texturas ligeras y activos calmantes para equilibrar la piel.',
    product: 'Niacinamida 10%',
  },
  {
    icon: '◈',
    name: 'Manchas',
    description: 'Rutinas antioxidantes para mejorar el tono y la luminosidad.',
    product: 'Sérum Vitamina C 20%',
  },
  {
    icon: '◎',
    name: 'Luminosidad',
    description: 'Productos pensados para piel apagada y cansada.',
    product: 'Kit Rutina Glow',
  },
  {
    icon: '✳',
    name: 'Resequedad',
    description: 'Hidratación profunda y recuperación de barrera cutánea.',
    product: 'HydraCalm Sheet Mask',
  },
]

export const ingredients = [
  {
    code: 'B3',
    name: 'Niacinamida',
    subtitle: 'Equilibrio y textura',
    description: 'Ayuda a suavizar la apariencia de poros y mejorar la textura de la piel.',
    tone: 'soft',
    image: '/images/texture-flatlay.jpg',
  },
  {
    code: 'C',
    name: 'Vitamina C',
    subtitle: 'Brillo y antioxidantes',
    description: 'Ilumina, protege contra el estrés ambiental y mejora el aspecto del tono apagado.',
    tone: 'gold',
    image: '/images/glycolic-serum.jpg',
  },
  {
    code: 'HA',
    name: 'Ácido Hialurónico',
    subtitle: 'Hidratación profunda',
    description: 'Retiene agua y aporta una sensación fresca, flexible y confortable.',
    tone: 'cream',
    image: '/images/product-cleanser-texture.jpg',
  },
]

export const routines = {
  am: [
    { step: '01', name: 'Limpieza suave', detail: 'Gel limpiador de espuma ligera para iniciar el día.' },
    { step: '02', name: 'Sérum antioxidante', detail: 'Vitamina C para iluminar y proteger la piel.' },
    { step: '03', name: 'Hidratación ligera', detail: 'Crema o gel hidratante según tu tipo de piel.' },
    { step: '04', name: 'Protector solar', detail: 'Aplica la regla de dos dedos para rostro y cuello.' },
  ],
  pm: [
    { step: '01', name: 'Doble limpieza', detail: 'Retira protector solar, grasa e impurezas acumuladas.' },
    { step: '02', name: 'Tratamiento reparador', detail: 'Niacinamida o exfoliante suave según tolerancia.' },
    { step: '03', name: 'Mascarilla o sérum', detail: 'Hidratación concentrada para recuperar la barrera.' },
    { step: '04', name: 'Crema nutritiva', detail: 'Sella la rutina y evita pérdida de humedad nocturna.' },
  ],
}

export const reviews = [
  {
    name: 'Sofía Ramírez',
    city: 'Ciudad de México',
    product: 'Sérum Vitamina C 20%',
    text: 'Mi piel se ve más luminosa y mi rutina por fin es fácil de seguir.',
  },
  {
    name: 'Valentina Torres',
    city: 'Querétaro',
    product: 'Rutina anti-manchas',
    text: 'Me gustó que las recomendaciones fueran claras y sin pasos innecesarios.',
  },
  {
    name: 'Andrea López',
    city: 'Guadalajara',
    product: 'Luma Water Cleanser',
    text: 'El limpiador no me deja la piel tirante y el sitio me ayudó a elegir mejor.',
  },
]

export const posts = [
  {
    id: 1,
    category: 'Rutinas',
    date: '12 jun 2026',
    read: '5 min lectura',
    title: 'Cómo saber qué necesita tu piel antes de comprar productos',
    summary: 'Una guía para identificar señales básicas de resequedad, sensibilidad, acné y manchas.',
    image: '/images/skin-tips.jpg',
  },
  {
    id: 2,
    category: 'Protección solar',
    date: '5 jun 2026',
    read: '4 min lectura',
    title: 'La regla de los dos dedos para aplicar protector solar',
    summary: 'Cantidad recomendada, frecuencia y errores comunes al proteger rostro y cuello.',
    image: '/images/sunscreen-two-fingers.jpg',
  },
  {
    id: 3,
    category: 'Ingredientes',
    date: '28 may 2026',
    read: '6 min lectura',
    title: 'Texturas de skincare: gel, crema, sérum y mascarilla',
    summary: 'Qué textura elegir según tu tipo de piel y el momento de tu rutina.',
    image: '/images/texture-flatlay.jpg',
  },
]

export const stats = [
  { label: 'Usuarios registrados', value: '1,240', change: '+18%' },
  { label: 'Mensajes atendidos', value: '830', change: '+24%' },
  { label: 'Rutinas consultadas', value: '4,910', change: '+31%' },
  { label: 'Satisfacción', value: '98%', change: '+3%' },
]

export const socials = [
  { name: 'Instagram', label: '@lumaskincare', url: 'https://www.instagram.com/' },
  { name: 'TikTok', label: '@lumaglow', url: 'https://www.tiktok.com/' },
  { name: 'Pinterest', label: 'Luma Skin', url: 'https://www.pinterest.com/' },
]

export const calendarEvents = [
  {
    id: 'verano-glow',
    name: 'Verano Glow',
    start: '2026-06-01',
    end: '2026-08-31',
    theme: 'summer',
    label: 'Temporada activa',
    title: 'Verano Glow: hidratación ligera y protección diaria',
    description: 'Durante junio, julio y agosto destacamos productos frescos, antioxidantes y protector solar para uso diario.',
    cta: 'Ver rutina de verano',
    target: 'rutinas',
  },
  {
    id: 'invierno-repair',
    name: 'Winter Repair',
    start: '2026-12-01',
    end: '2027-02-28',
    theme: 'winter',
    label: 'Temporada activa',
    title: 'Winter Repair: barrera fuerte y piel confortable',
    description: 'En invierno se recomiendan texturas más nutritivas, ceramidas y mascarillas de recuperación.',
    cta: 'Ver rutina reparadora',
    target: 'rutinas',
  },
]

export const seasonalUpdates = [
  {
    id: 'primavera',
    season: 'Primavera',
    months: 'Marzo · Abril · Mayo',
    theme: 'spring-update',
    title: 'Rutina primavera: calma y equilibrio',
    description: 'Recomendación de temporada para piel sensible, brotes ocasionales y cambios de clima.',
    banner: 'Limpieza suave, niacinamida y SPF diario.',
    routine: ['Limpieza sin sulfatos', 'Sérum equilibrante', 'Crema ligera', 'SPF 50'],
  },
  {
    id: 'verano',
    season: 'Verano',
    months: 'Junio · Julio · Agosto',
    theme: 'summer-update',
    title: 'Rutina verano: hidratación ligera y protector solar',
    description: 'Actualización pensada para calor, sudor, brillo y exposición solar.',
    banner: 'Protección, frescura y control de brillo para días cálidos.',
    routine: ['Gel limpiador', 'Vitamina C', 'Hidratante gel', 'Protector solar'],
  },
  {
    id: 'otono',
    season: 'Otoño',
    months: 'Septiembre · Octubre · Noviembre',
    theme: 'autumn-update',
    title: 'Rutina otoño: reparación y tono uniforme',
    description: 'Recomendación para recuperar luminosidad después del verano.',
    banner: 'Antioxidantes y recuperación gradual de barrera.',
    routine: ['Limpieza suave', 'Exfoliación moderada', 'Sérum reparador', 'Crema barrera'],
  },
  {
    id: 'invierno',
    season: 'Invierno',
    months: 'Diciembre · Enero · Febrero',
    theme: 'winter-update',
    title: 'Rutina invierno: nutrición y protección de barrera',
    description: 'Actualización para evitar resequedad, tirantez e irritación.',
    banner: 'Ceramidas, mascarillas y texturas nutritivas.',
    routine: ['Bálsamo limpiador', 'Ácido hialurónico', 'Crema rica', 'Mascarilla calmante'],
  },
]

export const highlightContents = [
  {
    id: 'vitamina-c',
    icon: 'C',
    title: 'Vitamina C',
    label: 'Luminosidad y antioxidantes',
    description: 'Ideal para piel apagada, manchas visibles y rutinas de mañana con protector solar.',
  },
  {
    id: 'niacinamida',
    icon: 'B3',
    title: 'Niacinamida',
    label: 'Poros, textura y equilibrio',
    description: 'Recomendada para piel mixta, brillo excesivo y apariencia de poros.',
  },
  {
    id: 'acido-hialuronico',
    icon: 'HA',
    title: 'Ácido Hialurónico',
    label: 'Hidratación flexible',
    description: 'Aporta hidratación ligera y ayuda a mantener la barrera cutánea cómoda.',
  },
  {
    id: 'spf',
    icon: 'SPF',
    title: 'Protector solar',
    label: 'Uso diario obligatorio',
    description: 'El paso clave para proteger resultados, prevenir manchas y cuidar la piel todo el año.',
  },
]

export const dashboardCards = [
  { title: 'Usuarios', value: 'roles activos', text: 'Administrador, Editor y Usuario.' },
  { title: 'Contenido', value: 'productos y blog', text: 'Módulos listos para administrar información.' },
  { title: 'Mensajes', value: 'contacto', text: 'Solicitudes capturadas desde el formulario.' },
  { title: 'Seguridad', value: 'sesión válida', text: 'Hash, token y permisos por rol.' },
]
