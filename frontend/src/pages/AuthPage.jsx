import { useState } from 'react'
import { apiRequest, saveStoredSession } from '../api'

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const EyeIcon = ({ visible }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {visible ? (
      <>
        <path d="M3 12s3.2-6 9-6 9 6 9 6-3.2 6-9 6-9-6-9-6z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    ) : (
      <>
        <path d="M4 4l16 16"></path>
        <path d="M3 12s3.2-6 9-6c2.2 0 4 .8 5.4 1.8"></path>
        <path d="M20.8 13.4C19.6 15.2 16.7 18 12 18c-5.8 0-9-6-9-6"></path>
      </>
    )}
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Z"></path>
    <path d="m9 12 2 2 4-5"></path>
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M4 21c1.8-4 4.5-6 8-6s6.2 2 8 6"></path>
  </svg>
)

function AuthPage({ onAuthenticated, showNotice, navigateTo }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const validateRegister = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Escribe nombres y apellidos.'
    if (!form.phone.trim()) return 'Escribe un teléfono de contacto.'
    if (!form.email.includes('@')) return 'Escribe un correo válido.'
    if (form.password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.'
    if (!/[A-ZÁÉÍÓÚÑ]/.test(form.password) || !/[a-záéíóúñ]/.test(form.password) || !/\d/.test(form.password)) return 'La contraseña debe incluir mayúscula, minúscula y número.'
    if (form.password !== form.confirmPassword) return 'Las contraseñas no coinciden.'
    return ''
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (mode === 'register') {
      const validationError = validateRegister()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setLoading(true)

    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : {
            name: `${form.firstName.trim()} ${form.lastName.trim()}`,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            email: form.email,
            password: form.password,
          }

      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const session = { token: data.token, user: data.user }
      saveStoredSession(session)
      onAuthenticated(session)
      showNotice(data.message || 'Sesión iniciada correctamente.')
      navigateTo('dashboard', '', { newTab: false })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <main className="auth-page-pro auth-page-premium standalone-auth-page">
      <section className="auth-visual-column">
        <div className="auth-visual-media">
          <img src="/images/product-set.jpg" alt="Productos Luma organizados para acceso privado" />
        </div>
        <div className="auth-visual-content">
          <a className="auth-logo" href="#/" onClick={(event) => { event.preventDefault(); navigateTo('home', 'inicio') }}>LUMA</a>
          <p className="eyebrow">Área privada Luma</p>
          <h1>Gestión segura para contenido y usuarios.</h1>
          <p>El panel valida sesiones, roles y permisos antes de mostrar cada módulo.</p>
          <div className="auth-feature-row" aria-label="Funciones del sistema de acceso">
            <span><ShieldIcon /> Hash seguro</span>
            <span><UserIcon /> Roles definidos</span>
            <span>Permisos por módulo</span>
          </div>
        </div>
      </section>

      <section className="auth-form-column">
        <button className="auth-back-link" type="button" onClick={() => navigateTo('home', 'inicio')}>← Volver al sitio</button>

        <form className="auth-card-pro" onSubmit={submit}>
          <div className="auth-card-topline">
            <div className="auth-lock-icon"><ShieldIcon /></div>
            <span>{mode === 'login' ? 'Acceso protegido' : 'Registro de usuario'}</span>
          </div>

          <div className="auth-title-pro">
            <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
            <p>
              {mode === 'login'
                ? 'Ingresa al panel según el rol y los permisos asignados a tu cuenta.'
                : 'El registro público crea una cuenta con rol Usuario. El administrador se configura desde el backend.'}
            </p>
          </div>

          <div className="auth-tabs-pro" role="tablist" aria-label="Acceso de usuarios">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Registro</button>
          </div>

          {mode === 'register' && (
            <div className="auth-register-grid">
              <label className="field-label premium-field">
                Nombres
                <input name="firstName" value={form.firstName} onChange={updateField} placeholder="Daniel" autoComplete="given-name" />
              </label>
              <label className="field-label premium-field">
                Apellidos
                <input name="lastName" value={form.lastName} onChange={updateField} placeholder="Hernández" autoComplete="family-name" />
              </label>
              <label className="field-label premium-field auth-field-full">
                Teléfono
                <input name="phone" value={form.phone} onChange={updateField} placeholder="+52 442 000 0000" autoComplete="tel" />
              </label>
            </div>
          )}

          <label className="field-label premium-field">
            Correo electrónico
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="tu@email.com" autoComplete="email" />
          </label>

          <label className="field-label premium-field">
            Contraseña
            <div className="password-field premium-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={updateField}
                placeholder="Mínimo 8 caracteres"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}>
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </label>

          {mode === 'register' && (
            <label className="field-label premium-field">
              Verificar contraseña
              <div className="password-field premium-password">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={updateField}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}>
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
            </label>
          )}

          {mode === 'register' && (
            <div className="auth-info-box">
              <strong>Cuenta de usuario</strong>
              <p>Esta cuenta puede entrar al panel personal y consultar contenido. No recibe permisos administrativos.</p>
            </div>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="btn btn-dark auth-submit" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar al panel' : 'Crear cuenta de usuario'}
          </button>

          <p className="auth-small-note">
            Las contraseñas se guardan con hash y la sesión se valida mediante token.
          </p>
        </form>
      </section>
    </main>
  )
}

export default AuthPage
