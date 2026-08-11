import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../api'
import { products, posts } from '../data/siteData'

function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission))
}

const formatDate = (value) => {
  if (!value) return 'Sin registro'
  try {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

const iconProps = { viewBox: '0 0 24 24', 'aria-hidden': true }

const ChartIcon = () => <svg {...iconProps}><path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M8 16v-5"></path><path d="M12 16V8"></path><path d="M16 16v-7"></path></svg>
const UsersIcon = () => <svg {...iconProps}><circle cx="9" cy="8" r="3"></circle><path d="M3 20c1.4-3.5 3.4-5.2 6-5.2s4.6 1.7 6 5.2"></path><path d="M16 11a2.8 2.8 0 0 0 0-5.5"></path><path d="M17 15c2 .5 3.3 2 4 5"></path></svg>
const MailIcon = () => <svg {...iconProps}><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>
const LockIcon = () => <svg {...iconProps}><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>
const PowerIcon = () => <svg {...iconProps}><path d="M12 3v9"></path><path d="M6.6 6.8a8 8 0 1 0 10.8 0"></path></svg>
const RefreshIcon = () => <svg {...iconProps}><path d="M20 6v5h-5"></path><path d="M4 18v-5h5"></path><path d="M19 11a7 7 0 0 0-12-4l-3 3"></path><path d="M5 13a7 7 0 0 0 12 4l3-3"></path></svg>
const ShieldIcon = () => <svg {...iconProps}><path d="M12 3 5 6v5c0 4.2 2.6 7.8 7 10 4.4-2.2 7-5.8 7-10V6l-7-3Z"></path><path d="m9.5 12 1.7 1.7L15 10"></path></svg>
const ContentIcon = () => <svg {...iconProps}><path d="M5 4h14v16H5z"></path><path d="M8 8h8"></path><path d="M8 12h8"></path><path d="M8 16h5"></path></svg>
const HomeIcon = () => <svg {...iconProps}><path d="M4 11.5 12 4l8 7.5"></path><path d="M6 10.5V20h12v-9.5"></path><path d="M10 20v-5h4v5"></path></svg>
const SparkIcon = () => <svg {...iconProps}><path d="M12 3l1.8 5.1L19 10l-5.2 1.9L12 17l-1.8-5.1L5 10l5.2-1.9L12 3Z"></path><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 23l-.9-2.6-2.6-.9 2.6-.9L19 15Z"></path></svg>
const ProfileIcon = () => <svg {...iconProps}><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.8-4.2 4.5-6.3 8-6.3s6.2 2.1 8 6.3"></path></svg>

const initialUserForm = {
  name: '',
  email: '',
  password: 'Alumno1234',
  role: 'Usuario',
  requiresPasswordChange: true,
}

function MiniLineChart({ data }) {
  const safeData = data?.length > 1 ? data : [{ label: 'Inicio', value: 1 }, { label: 'Hoy', value: 2 }]
  const maxValue = Math.max(...safeData.map((item) => Number(item.value) || 0), 1)
  const points = safeData.map((item, index) => {
    const x = (index / (safeData.length - 1)) * 100
    const y = 100 - ((Number(item.value) || 0) / maxValue) * 86 - 7
    return `${x},${Math.max(7, Math.min(93, y))}`
  }).join(' ')

  return (
    <div className="console-chart-block-v19">
      <div className="console-line-chart-v17" aria-label="Gráfica de actividad del panel">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline className="console-line-fill-v17" points={`0,100 ${points} 100,100`} />
          <polyline className="console-line-stroke-v17" points={points} />
        </svg>
      </div>
      <div className="chart-data-row-v19" aria-label="Datos graficados">
        {safeData.map((item) => (
          <span key={item.label}><b>{item.value}</b>{item.label}</span>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ active = 0, inactive = 0 }) {
  const total = Math.max(active + inactive, 1)
  const activePercent = Math.round((active / total) * 100)
  return (
    <div className="console-donut-wrap-v17">
      <div className="console-donut-v17" style={{ '--donut-value': `${activePercent}%` }}>
        <strong>{activePercent}%</strong>
        <span>habilitados</span>
      </div>
      <div className="console-donut-legend-v17">
        <span><b className="dot enabled"></b>{active} habilitados</span>
        <span><b className="dot disabled"></b>{inactive} deshabilitados</span>
      </div>
    </div>
  )
}

function DashboardPage({ user, navigateTo, showNotice, onLogout, onUserUpdate }) {
  const [activeModule, setActiveModule] = useState('overview')
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [overview, setOverview] = useState(null)
  const [contentStatus, setContentStatus] = useState('')
  const [error, setError] = useState('')
  const [userForm, setUserForm] = useState(initialUserForm)
  const [userActionStatus, setUserActionStatus] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', name: '' })
  const [profileStatus, setProfileStatus] = useState('')
  const [contentItems, setContentItems] = useState({ products: [], posts: [] })
  const [contentType, setContentType] = useState('product')
  const [editingContent, setEditingContent] = useState(null)
  const [contentForm, setContentForm] = useState({ title: '', category: '', description: '', image: '' })

  const roleLabel = useMemo(() => user?.roles?.join(', ') || 'Usuario', [user])
  const isAdmin = hasPermission(user, 'users:read')
  const canManageUsers = hasPermission(user, 'users:manage')
  const isEditor = hasPermission(user, 'content:manage')
  const canReadMessages = hasPermission(user, 'messages:read')
  const isBasicUser = user && !isAdmin && !isEditor

  useEffect(() => {
    if (!user) return
    const inferredNames = String(user.name || '').split(' ')
    setProfileForm({
      firstName: user.firstName || inferredNames[0] || '',
      lastName: user.lastName || inferredNames.slice(1).join(' ') || '',
      phone: user.phone || '',
      name: user.name || '',
    })
  }, [user])

  const loadUsers = async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const data = await apiRequest('/api/admin/users')
      setUsers(data.users || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadContent = async () => {
    if (!isEditor) return
    try {
      const data = await apiRequest('/api/admin/content')
      setContentItems({ products: data.products || [], posts: data.posts || [] })
    } catch (loadError) {
      setContentStatus(loadError.message)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadProtectedData() {
      if (!user) return
      setError('')

      try {
        const overviewData = await apiRequest('/api/admin/overview')
        if (!ignore) setOverview(overviewData)

        if (isAdmin) {
          const data = await apiRequest('/api/admin/users')
          if (!ignore) setUsers(data.users || [])
        }

        if (canReadMessages) {
          const data = await apiRequest('/api/admin/messages')
          if (!ignore) setMessages(data.contacts || [])
        }

        if (isEditor) {
          const data = await apiRequest('/api/admin/content')
          if (!ignore) setContentItems({ products: data.products || [], posts: data.posts || [] })
        }
      } catch (loadError) {
        if (!ignore) setError(loadError.message)
      }
    }

    loadProtectedData()
    return () => { ignore = true }
  }, [user, isAdmin, canReadMessages, isEditor])

  const modules = useMemo(() => {
    if (!user) return []

    const base = [
      { id: 'overview', label: isBasicUser ? 'Inicio' : 'Dashboard', icon: <ChartIcon />, visible: true },
      { id: 'profile', label: 'Mi perfil', icon: <ProfileIcon />, visible: true },
      { id: 'content', label: isBasicUser ? 'Guías' : 'Contenido', icon: <ContentIcon />, visible: isEditor || isBasicUser },
      { id: 'routine', label: 'Rutina', icon: <SparkIcon />, visible: isBasicUser },
      { id: 'messages', label: 'Mensajes', icon: <MailIcon />, visible: canReadMessages },
      { id: 'accounts', label: 'Cuentas', icon: <UsersIcon />, visible: isAdmin },
      { id: 'security', label: 'Seguridad', icon: <ShieldIcon />, visible: true },
    ]

    return base.filter((item) => item.visible)
  }, [user, isBasicUser, isEditor, canReadMessages, isAdmin])

  useEffect(() => {
    if (!modules.length) return
    if (!modules.some((item) => item.id === activeModule)) {
      setActiveModule(modules[0].id)
    }
  }, [modules, activeModule])

  const createDemoPost = async () => {
    try {
      const data = await apiRequest('/api/admin/content/demo-post', {
        method: 'POST',
        body: JSON.stringify({ title: `Nota editorial ${new Date().toLocaleTimeString()}` }),
      })
      setContentStatus(data.message)
      showNotice(data.message)
    } catch (postError) {
      setContentStatus(postError.message)
    }
  }

  const updateUserForm = (event) => {
    const { name, value, type, checked } = event.target
    setUserForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const createUser = async (event) => {
    event.preventDefault()
    setUserActionStatus('')

    try {
      const data = await apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userForm),
      })
      setUserActionStatus(data.message)
      showNotice(data.message)
      setUserForm(initialUserForm)
      await loadUsers()
    } catch (createError) {
      setUserActionStatus(createError.message)
    }
  }

  const createPracticeUsers = async () => {
    setUserActionStatus('')
    try {
      const data = await apiRequest('/api/admin/users/practice-seed', { method: 'POST' })
      setUserActionStatus(data.message)
      showNotice(data.message)
      await loadUsers()
    } catch (seedError) {
      setUserActionStatus(seedError.message)
    }
  }

  const toggleUserStatus = async (item) => {
    const active = !(item.activo ?? item.active)
    setUserActionStatus('')
    try {
      const data = await apiRequest(`/api/admin/users/${item.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      })
      setUserActionStatus(data.message)
      showNotice(data.message)
      await loadUsers()
    } catch (statusError) {
      setUserActionStatus(statusError.message)
    }
  }

  const togglePasswordChange = async (item) => {
    const requiresPasswordChange = !(item.requiere_cambio_password ?? item.requiresPasswordChange)
    setUserActionStatus('')
    try {
      const data = await apiRequest(`/api/admin/users/${item.id}/password-change`, {
        method: 'PATCH',
        body: JSON.stringify({ requiresPasswordChange }),
      })
      setUserActionStatus(data.message)
      showNotice(data.message)
      await loadUsers()
    } catch (passwordError) {
      setUserActionStatus(passwordError.message)
    }
  }

  const deleteUser = async (item) => {
    const confirmation = window.confirm(`¿Eliminar a ${item.nombre || item.name}? Para auditoría es mejor deshabilitar; elimina solo como prueba.`)
    if (!confirmation) return

    setUserActionStatus('')
    try {
      const data = await apiRequest(`/api/admin/users/${item.id}`, { method: 'DELETE' })
      setUserActionStatus(data.message)
      showNotice(data.message)
      await loadUsers()
    } catch (deleteError) {
      setUserActionStatus(deleteError.message)
    }
  }

  if (!user) {
    return (
      <main className="admin-console-v17 access-only-v17">
        <section className="console-access-card-v17">
          <p className="eyebrow">Acceso protegido</p>
          <h1>Debes iniciar sesión</h1>
          <p>Este módulo valida la sesión antes de mostrar recursos privados.</p>
          <button className="btn btn-dark" onClick={() => navigateTo('auth', '', { newTab: false })}>Ir al login</button>
        </section>
      </main>
    )
  }

  const metrics = overview?.metrics || {}
  const activeUsers = users.filter((item) => item.activo ?? item.active).length
  const inactiveUsers = Math.max(users.length - activeUsers, 0)
  const chartData = [
    { label: 'Usuarios', value: Number(metrics.users ?? users.length ?? 0) },
    { label: 'Mensajes', value: Number(metrics.contacts ?? messages.length ?? 0) },
    { label: 'Productos', value: Number(metrics.products ?? products.length ?? 0) },
    { label: 'Artículos', value: Number(metrics.posts ?? posts.length ?? 0) },
    { label: 'Admins', value: Number(metrics.admins ?? activeUsers ?? 0) },
  ]

  const visibleMetrics = isAdmin
    ? [
        { label: 'Usuarios', value: metrics.users ?? users.length ?? 0, helper: 'Cuentas registradas', icon: <UsersIcon /> },
        { label: 'Mensajes', value: metrics.contacts ?? messages.length ?? 0, helper: 'Solicitudes recibidas', icon: <MailIcon /> },
        { label: 'Contenido', value: (metrics.products ?? products.length) + (metrics.posts ?? posts.length), helper: 'Productos y artículos', icon: <ContentIcon /> },
        { label: 'Admins', value: metrics.admins ?? 1, helper: 'Cuentas privilegiadas', icon: <LockIcon /> },
      ]
    : isEditor
      ? [
          { label: 'Productos', value: metrics.products ?? products.length, helper: 'Catálogo editorial', icon: <ContentIcon /> },
          { label: 'Artículos', value: metrics.posts ?? posts.length, helper: 'Blog y guías', icon: <ChartIcon /> },
          { label: 'Mensajes', value: metrics.contacts ?? messages.length, helper: 'Solicitudes por revisar', icon: <MailIcon /> },
        ]
      : [
          { label: 'Rol', value: 'Usuario', helper: 'Acceso personal', icon: <UsersIcon /> },
          { label: 'Rutinas', value: '2', helper: 'Mañana y noche', icon: <SparkIcon /> },
          { label: 'Guías', value: posts.length, helper: 'Contenido recomendado', icon: <ContentIcon /> },
        ]

  const activeModuleLabel = modules.find((item) => item.id === activeModule)?.label || 'Panel'

  const renderOverview = () => (
    <div className="console-module-v17">
      <section className="console-hero-v17">
        <div>
          <p className="eyebrow">Panel privado</p>
          <h1>{isAdmin ? 'Centro administrativo' : isEditor ? 'Mesa editorial' : 'Mi espacio Luma'}</h1>
          <p>{isAdmin ? 'Control de cuentas, estados, mensajes, contenido y seguridad desde módulos separados.' : isEditor ? 'Administra contenido y solicitudes sin acceso a cuentas privilegiadas.' : 'Consulta guías y rutinas recomendadas mientras el área administrativa se mantiene protegida.'}</p>
        </div>
        <aside className="console-session-card-v17">
          <span>Sesión activa</span>
          <strong>{roleLabel}</strong>
          <small>{user.email}</small>
        </aside>
      </section>

      {error && <p className="auth-error dashboard-error">{error}</p>}

      <section className="console-metrics-v17">
        {visibleMetrics.map((metric) => (
          <article className="console-metric-v17" key={metric.label}>
            <span>{metric.icon}</span>
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
            <p>{metric.helper}</p>
          </article>
        ))}
      </section>

      {(isAdmin || isEditor) && (
        <section className="console-analytics-grid-v17">
          <article className="console-card-v17">
            <div className="console-card-head-v17">
              <div><p className="eyebrow">Actividad</p><h2>Actividad del panel</h2><p>La gráfica compara los datos administrativos actuales: usuarios, mensajes, productos, artículos y administradores.</p></div>
              <b>Datos actuales</b>
            </div>
            <MiniLineChart data={chartData} />
          </article>
          <article className="console-card-v17 compact-v17">
            <div className="console-card-head-v17">
              <div><p className="eyebrow">Cuentas</p><h2>Estado de acceso</h2></div>
            </div>
            <DonutChart active={activeUsers || Number(metrics.users || 0)} inactive={inactiveUsers} />
          </article>
        </section>
      )}
    </div>
  )

  const renderProfile = () => (
    <section className="console-card-v17 console-module-v17 profile-card-v17">
      <div className="console-card-head-v17">
        <div>
          <p className="eyebrow">Perfil</p>
          <h2>Información de la cuenta</h2>
          <p>Edita tus datos personales sin cambiar tu rol ni permisos asignados.</p>
        </div>
      </div>
      <form className="profile-edit-form-v19" onSubmit={submitProfile}>
        <label>Nombres<input name="firstName" value={profileForm.firstName} onChange={updateProfileForm} placeholder="Tus nombres" /></label>
        <label>Apellidos<input name="lastName" value={profileForm.lastName} onChange={updateProfileForm} placeholder="Tus apellidos" /></label>
        <label>Teléfono<input name="phone" value={profileForm.phone} onChange={updateProfileForm} placeholder="442 000 0000" /></label>
        <label>Correo<input value={user.email} disabled /></label>
        <div className="profile-readonly-v19"><span>Rol</span><strong>{roleLabel}</strong></div>
        <div className="profile-readonly-v19"><span>Estado</span><strong>Habilitado</strong></div>
        <button className="btn btn-dark" type="submit">Guardar cambios</button>
      </form>
      {profileStatus && <p className="module-status">{profileStatus}</p>}
    </section>
  )

  const openContentItem = (item) => {
    if (isBasicUser) {
      navigateTo('blog', '', { newTab: false })
      return
    }
    navigateTo('products', '', { newTab: false })
  }

  const openRoutineGuide = () => {
    navigateTo('products', '', { newTab: false })
  }

  const updateProfileForm = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setProfileStatus('')
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim() || profileForm.name
      const data = await apiRequest('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ ...profileForm, name: fullName }),
      })
      setProfileStatus(data.message)
      showNotice(data.message)
      if (data.user && onUserUpdate) onUserUpdate(data.user)
    } catch (profileError) {
      setProfileStatus(profileError.message)
    }
  }

  const updateContentForm = (event) => {
    const { name, value } = event.target
    setContentForm((current) => ({ ...current, [name]: value }))
  }

  const resetContentForm = () => {
    setEditingContent(null)
    setContentForm({ title: '', category: '', description: '', image: '' })
  }

  const editContentItem = (type, item) => {
    setContentType(type)
    setEditingContent({ type, id: item.id })
    setContentForm({
      title: item.title || item.name || '',
      category: item.category || '',
      description: item.summary || item.description || '',
      image: item.image || '',
    })
  }

  const submitContent = async (event) => {
    event.preventDefault()
    setContentStatus('')
    const payload = { type: contentType, ...contentForm }
    try {
      const data = await apiRequest(editingContent ? `/api/admin/content/items/${editingContent.type}/${editingContent.id}` : '/api/admin/content/items', {
        method: editingContent ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      setContentStatus(data.message)
      showNotice(data.message)
      resetContentForm()
      await loadContent()
    } catch (contentError) {
      setContentStatus(contentError.message)
    }
  }

  const toggleContentVisibility = async (type, item) => {
    const active = !(item.is_active ?? item.isActive ?? true)
    try {
      const data = await apiRequest(`/api/admin/content/items/${type}/${item.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      })
      setContentStatus(data.message)
      showNotice(data.message)
      await loadContent()
    } catch (contentError) {
      setContentStatus(contentError.message)
    }
  }

  const deleteContentItem = async (type, item) => {
    if (!window.confirm(`¿Eliminar ${item.title || item.name}?`)) return
    try {
      const data = await apiRequest(`/api/admin/content/items/${type}/${item.id}`, { method: 'DELETE' })
      setContentStatus(data.message)
      showNotice(data.message)
      await loadContent()
    } catch (contentError) {
      setContentStatus(contentError.message)
    }
  }

  const renderContent = () => {
    const adminList = contentType === 'post' ? contentItems.posts : contentItems.products
    const userList = posts

    return (
      <section className="console-card-v17 console-module-v17">
        <div className="console-card-head-v17">
          <div>
            <p className="eyebrow">{isBasicUser ? 'Guías disponibles' : 'Contenido del sitio'}</p>
            <h2>{isBasicUser ? 'Lecturas recomendadas' : 'Productos y artículos'}</h2>
            <p>{isBasicUser ? 'Selecciona una lectura para abrir el blog dentro de la misma aplicación.' : 'Agrega, edita, elimina, oculta o vuelve a mostrar productos y artículos del sitio.'}</p>
          </div>
        </div>

        {isEditor && (
          <div className="content-admin-layout-v19">
            <form className="content-editor-form-v19" onSubmit={submitContent}>
              <div className="content-type-tabs-v19">
                <button type="button" className={contentType === 'product' ? 'active' : ''} onClick={() => { setContentType('product'); resetContentForm() }}>Producto</button>
                <button type="button" className={contentType === 'post' ? 'active' : ''} onClick={() => { setContentType('post'); resetContentForm() }}>Artículo</button>
              </div>
              <label>{contentType === 'post' ? 'Título del artículo' : 'Nombre del producto'}<input name="title" value={contentForm.title} onChange={updateContentForm} placeholder={contentType === 'post' ? 'Guía para piel sensible' : 'Sérum Vitamina C'} /></label>
              <label>Categoría<input name="category" value={contentForm.category} onChange={updateContentForm} placeholder="Luminosidad" /></label>
              <label>Imagen<input name="image" value={contentForm.image} onChange={updateContentForm} placeholder="/images/product-set.jpg" /></label>
              <label className="content-form-wide-v19">Descripción / resumen<textarea name="description" value={contentForm.description} onChange={updateContentForm} placeholder="Descripción del contenido" /></label>
              <div className="content-form-actions-v19">
                <button className="btn btn-dark" type="submit">{editingContent ? 'Guardar edición' : 'Agregar contenido'}</button>
                {editingContent && <button className="btn btn-light" type="button" onClick={resetContentForm}>Cancelar</button>}
              </div>
            </form>
            {contentStatus && <p className="module-status">{contentStatus}</p>}
            <div className="content-manager-list-v19">
              {adminList.map((item) => {
                const type = contentType
                const active = item.is_active ?? item.isActive ?? true
                return (
                  <article key={`${type}-${item.id}`} className={!active ? 'is-hidden' : ''}>
                    <img src={item.image || '/images/product-set.jpg'} alt={item.title || item.name} />
                    <div>
                      <span>{item.category}</span>
                      <strong>{item.title || item.name}</strong>
                      <small>{active ? 'Visible' : 'Oculto'}</small>
                    </div>
                    <div className="content-actions-v19">
                      <button type="button" onClick={() => editContentItem(type, item)}>Editar</button>
                      <button type="button" onClick={() => toggleContentVisibility(type, item)}>{active ? 'Ocultar' : 'Desocultar'}</button>
                      <button type="button" className="danger" onClick={() => deleteContentItem(type, item)}>Eliminar</button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {isBasicUser && (
          <div className="console-content-grid-v17">
            {userList.slice(0, 3).map((item) => (
              <button className="console-content-card-v18" type="button" key={item.id} onClick={() => openContentItem(item)}>
                <img src={item.image} alt={item.title} />
                <span>{item.category}</span>
                <strong>{item.title}</strong>
                <small>Abrir lectura</small>
              </button>
            ))}
          </div>
        )}
      </section>
    )
  }

  const renderRoutine = () => (
    <section className="console-card-v17 console-module-v17">
      <div className="console-card-head-v17">
        <div>
          <p className="eyebrow">Rutina personal</p>
          <h2>Recomendación básica</h2>
          <p>Selecciona un paso para abrir la guía de productos relacionada dentro de esta misma vista.</p>
        </div>
        <button className="btn btn-dark" type="button" onClick={openRoutineGuide}>Ver productos</button>
      </div>
      <div className="routine-steps-v17">
        {['Limpieza suave', 'Sérum antioxidante', 'Hidratación ligera', 'Protector solar SPF 50'].map((step, index) => (
          <button className="routine-step-button-v18" type="button" key={step} onClick={openRoutineGuide}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{step}</strong>
            <p>Guía simple para mantener constancia diaria.</p>
          </button>
        ))}
      </div>
    </section>
  )

  const renderMessages = () => (
    <section className="console-card-v17 console-module-v17">
      <div className="console-card-head-v17">
        <div><p className="eyebrow">Solicitudes</p><h2>Mensajes de contacto</h2><p>Tabla de mensajes recibidos desde el formulario público.</p></div>
      </div>
      <div className="messages-table-v19">
        <div className="messages-row-v19 messages-head-v19"><span>Nombre</span><span>Correo</span><span>Mensaje</span><span>Fecha</span></div>
        {messages.length === 0 && <p className="table-loading">No hay mensajes registrados todavía.</p>}
        {messages.map((message, index) => (
          <div className="messages-row-v19" key={message.id || index}>
            <span>{message.name || message.nombre || 'Sin nombre'}</span>
            <span>{message.email}</span>
            <span>{message.message || message.mensaje}</span>
            <span>{formatDate(message.created_at || message.createdAt)}</span>
          </div>
        ))}
      </div>
    </section>
  )

  const renderAccounts = () => (
    <section className="console-card-v17 console-module-v17">
      <div className="console-card-head-v17">
        <div>
          <p className="eyebrow">Administración de cuentas</p>
          <h2>Usuarios del sistema</h2>
          <p>Crea, verifica, deshabilita y vuelve a habilitar cuentas sin eliminarlas, conservando evidencia y trazabilidad.</p>
        </div>
        {canManageUsers && <button className="btn btn-light" onClick={createPracticeUsers}>Crear usuarios de práctica</button>}
      </div>

      {canManageUsers && (
        <form className="console-account-form-v17" onSubmit={createUser}>
          <label>Nombre completo<input name="name" value={userForm.name} onChange={updateUserForm} placeholder="Ej. Alumno Uno" /></label>
          <label>Correo<input name="email" type="email" value={userForm.email} onChange={updateUserForm} placeholder="usuario@luma.local" /></label>
          <label>Contraseña temporal<input name="password" value={userForm.password} onChange={updateUserForm} placeholder="Alumno1234" /></label>
          <label>Grupo / rol<select name="role" value={userForm.role} onChange={updateUserForm}><option value="Usuario">Usuario</option><option value="Editor">Editor</option></select></label>
          <label className="console-check-v17"><input name="requiresPasswordChange" type="checkbox" checked={userForm.requiresPasswordChange} onChange={updateUserForm} />Requiere cambio de contraseña</label>
          <button className="btn btn-dark" type="submit">Crear usuario</button>
        </form>
      )}

      {userActionStatus && <p className="module-status">{userActionStatus}</p>}

      <div className="console-account-notes-v17">
        <article><PowerIcon /><strong>Deshabilitar</strong><span>Conserva la cuenta, pero bloquea el inicio de sesión.</span></article>
        <article><RefreshIcon /><strong>Habilitar</strong><span>Cambia la propiedad activo para recuperar acceso.</span></article>
        <article><LockIcon /><strong>Auditoría</strong><span>Conserva fecha de creación, último acceso, grupo y estado.</span></article>
      </div>

      <div className="console-table-wrap-v17">
        <div className="console-user-table-v17">
          <div className="console-user-row-v17 table-head-v17"><span>Usuario</span><span>Estado</span><span>Grupo</span><span>Cambio contraseña</span><span>Creado</span><span>Último inicio</span><span>Acciones</span></div>
          {loadingUsers && <p className="table-loading">Cargando usuarios...</p>}
          {users.map((item) => {
            const active = item.activo ?? item.active
            const passwordChange = item.requiere_cambio_password ?? item.requiresPasswordChange
            const roles = Array.isArray(item.roles) ? item.roles : []
            const group = item.grupo_sistema || item.group || roles.join(', ') || 'Usuarios'
            const isSelf = item.id === user.id
            return (
              <div className="console-user-row-v17" key={item.id}>
                <span><strong>{item.nombre || item.name}</strong><small>{item.email}</small></span>
                <span><b className={active ? 'status-pill enabled' : 'status-pill disabled'}>{active ? 'Habilitado' : 'Deshabilitado'}</b></span>
                <span>{group}</span>
                <span>{passwordChange ? 'Sí' : 'No'}</span>
                <span>{formatDate(item.creado_en || item.createdAt)}</span>
                <span>{formatDate(item.ultimo_login || item.lastLogin)}</span>
                <span className="console-actions-v17">
                  <button type="button" onClick={() => toggleUserStatus(item)} disabled={isSelf}>{active ? 'Deshabilitar' : 'Habilitar'}</button>
                  <button type="button" onClick={() => togglePasswordChange(item)}>{passwordChange ? 'Quitar cambio' : 'Pedir cambio'}</button>
                  <button type="button" className="danger" onClick={() => deleteUser(item)} disabled={roles.includes('Administrador') || isSelf}>Eliminar</button>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )

  const renderSecurity = () => (
    <section className="console-card-v17 console-module-v17">
      <p className="eyebrow">Seguridad</p>
      <h2>Estado de sesión y permisos</h2>
      <p>Este módulo resume por qué puedes ver cada vista del panel. El backend valida tu token de sesión y revisa tus roles antes de permitir acceso a cuentas, mensajes o contenido.</p>
      <div className="security-summary-v18">
        <article><ShieldIcon /><strong>Sesión validada</strong><span>El token se revisa contra sesiones activas y no revocadas.</span></article>
        <article><LockIcon /><strong>Control por rol</strong><span>Administrador, Editor y Usuario tienen permisos diferentes.</span></article>
        <article><UsersIcon /><strong>Acceso protegido</strong><span>Una cuenta deshabilitada no puede iniciar sesión.</span></article>
      </div>
      <div className="permission-tags-v16 console-permission-tags-v17">
        {(user.permissions || []).map((permission) => <span key={permission}>{permission}</span>)}
      </div>
      <div className="console-command-card-v17">
        <strong>Endpoint de evidencia</strong>
        <code>PATCH /api/admin/users/:id/status {'{ active: false }'}</code>
      </div>
    </section>
  )

  const renderActiveModule = () => {
    if (activeModule === 'overview') return renderOverview()
    if (activeModule === 'profile') return renderProfile()
    if (activeModule === 'content') return renderContent()
    if (activeModule === 'routine') return renderRoutine()
    if (activeModule === 'messages') return renderMessages()
    if (activeModule === 'accounts') return renderAccounts()
    if (activeModule === 'security') return renderSecurity()
    return renderOverview()
  }

  return (
    <main className="admin-console-v17">
      <aside className="console-sidebar-v17">
        <div className="console-brand-v17">
          <strong>LUMA</strong>
          <span>{roleLabel}</span>
        </div>

        <nav aria-label="Módulos del panel" className="console-nav-v17">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={activeModule === module.id ? 'active' : ''}
              onClick={() => setActiveModule(module.id)}
            >
              {module.icon}
              {module.label}
            </button>
          ))}
        </nav>

        <div className="console-sidebar-actions-v17">
          <button type="button" onClick={() => navigateTo('home')}><HomeIcon />Ver sitio</button>
          <button type="button" className="logout" onClick={onLogout}><PowerIcon />Cerrar sesión</button>
        </div>
      </aside>

      <section className="console-main-v17">
        <header className="console-topbar-v17">
          <div>
            <span>Panel Luma</span>
            <strong>{activeModuleLabel}</strong>
          </div>
          <div className="console-user-v17">
            <b>{user.name?.slice(0, 1) || 'L'}</b>
            <div><strong>{user.name}</strong><small>{user.email}</small></div>
          </div>
        </header>
        {renderActiveModule()}
      </section>
    </main>
  )
}

export default DashboardPage
