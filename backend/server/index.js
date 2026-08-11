import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import pg from 'pg'
import { products, categories, ingredients, posts } from '../data/siteData.js'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 4000
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
const sessionDays = Number(process.env.SESSION_DAYS || 7)
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null

const memory = {
  newsletter: [],
  contacts: [],
  users: [],
  sessions: [],
  nextUserId: 1,
}

const defaultRoles = [
  { name: 'Administrador', description: 'Control total de usuarios, contenido, mensajes y configuración.' },
  { name: 'Editor', description: 'Administración de contenido informativo del sitio.' },
  { name: 'Usuario', description: 'Acceso a perfil, consulta de contenido y recursos personalizados.' },
]

const defaultPermissions = [
  { code: 'dashboard:view', description: 'Puede entrar al panel protegido.' },
  { code: 'users:read', description: 'Puede consultar usuarios registrados.' },
  { code: 'users:manage', description: 'Puede administrar usuarios, roles y estado de cuentas.' },
  { code: 'content:read', description: 'Puede consultar contenido administrativo.' },
  { code: 'content:manage', description: 'Puede crear o editar contenido del sitio.' },
  { code: 'messages:read', description: 'Puede revisar mensajes del formulario de contacto.' },
  { code: 'profile:read', description: 'Puede consultar su propio perfil.' },
]

const rolePermissions = {
  Administrador: ['dashboard:view', 'users:read', 'users:manage', 'content:read', 'content:manage', 'messages:read', 'profile:read'],
  Editor: ['dashboard:view', 'content:read', 'content:manage', 'messages:read', 'profile:read'],
  Usuario: ['dashboard:view', 'content:read', 'profile:read'],
}

app.use(cors({ origin: [frontendOrigin, 'http://127.0.0.1:5173'], credentials: true }))
app.use(express.json({ limit: '1mb' }))

const hasValidEmail = (email = '') => /\S+@\S+\.\S+/.test(email)
const hasStrongPassword = (password = '') => password.length >= 8 && /[A-ZÁÉÍÓÚÑ]/.test(password) && /[a-záéíóúñ]/.test(password) && /\d/.test(password)
const normalizeEmail = (email = '') => email.trim().toLowerCase()
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex')
const createToken = () => crypto.randomBytes(32).toString('hex')
const expiresAt = () => new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000)

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$16384$8$1$${salt}$${hash}`
}

function verifyPassword(password, storedHash = '') {
  try {
    const [algorithm, n, r, p, salt, expected] = storedHash.split('$')
    if (algorithm !== 'scrypt' || !salt || !expected) return false
    const hash = crypto.scryptSync(password, salt, 64, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    })
    const expectedBuffer = Buffer.from(expected, 'hex')
    if (hash.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(hash, expectedBuffer)
  } catch {
    return false
  }
}

function publicUser(user, roles = [], permissions = []) {
  return {
    id: user.id,
    name: user.name || user.nombre,
    firstName: user.firstName || user.nombres || '',
    lastName: user.lastName || user.apellidos || '',
    phone: user.phone || user.telefono || '',
    email: user.email,
    active: user.active ?? user.activo,
    requiresPasswordChange: user.requiresPasswordChange ?? user.requiere_cambio_password ?? false,
    group: user.group || user.grupo_sistema || (roles.includes('Editor') ? 'Editores' : 'Usuarios'),
    createdAt: user.createdAt || user.creado_en || null,
    lastLogin: user.lastLogin || user.ultimo_login || null,
    roles,
    permissions,
  }
}

function extractBearer(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice(7).trim()
}

async function getRows(sql, values = []) {
  if (!pool) return null
  const result = await pool.query(sql, values)
  return result.rows
}

async function ensureAuthCatalog() {
  if (!pool) return

  for (const role of defaultRoles) {
    await pool.query(
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion',
      [role.name, role.description],
    )
  }

  for (const permission of defaultPermissions) {
    await pool.query(
      'INSERT INTO permisos (codigo, descripcion) VALUES ($1, $2) ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion',
      [permission.code, permission.description],
    )
  }

  for (const [roleName, permissionCodes] of Object.entries(rolePermissions)) {
    for (const code of permissionCodes) {
      await pool.query(
        `INSERT INTO rol_permiso (rol_id, permiso_id)
         SELECT r.id, p.id
         FROM roles r, permisos p
         WHERE r.nombre = $1 AND p.codigo = $2
         ON CONFLICT DO NOTHING`,
        [roleName, code],
      )
    }
  }
}

async function ensureDefaultContent() {
  if (!pool) return

  const [productCount] = await getRows('SELECT COUNT(*)::int AS total FROM products')
  if ((productCount?.total || 0) === 0) {
    for (const item of products) {
      await pool.query(
        `INSERT INTO products (name, category, goal, tag, description, image, ingredients, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [item.name, item.category || 'General', item.goal || '', item.tag || item.category || 'General', item.description || 'Producto Luma.', item.image || '/images/product-set.jpg', item.ingredients || []],
      )
    }
  }

  const [postCount] = await getRows('SELECT COUNT(*)::int AS total FROM blog_posts')
  if ((postCount?.total || 0) === 0) {
    for (const item of posts) {
      await pool.query(
        `INSERT INTO blog_posts (category, published_date, read_time, title, summary, image, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [item.category || 'Blog', item.date || '', item.read || '4 min lectura', item.title, item.summary || 'Guía editorial Luma.', item.image || '/images/blog-routines.svg'],
      )
    }
  }
}

async function loadDbUserAccess(userId) {
  const roles = await getRows(
    `SELECT r.nombre
     FROM roles r
     INNER JOIN usuario_rol ur ON ur.rol_id = r.id
     WHERE ur.usuario_id = $1
     ORDER BY r.nombre`,
    [userId],
  )

  const permissions = await getRows(
    `SELECT DISTINCT p.codigo
     FROM permisos p
     INNER JOIN rol_permiso rp ON rp.permiso_id = p.id
     INNER JOIN usuario_rol ur ON ur.rol_id = rp.rol_id
     WHERE ur.usuario_id = $1
     ORDER BY p.codigo`,
    [userId],
  )

  return {
    roles: roles.map((row) => row.nombre),
    permissions: permissions.map((row) => row.codigo),
  }
}

function loadMemoryUserAccess(userId) {
  const user = memory.users.find((item) => item.id === userId)
  const roles = user?.roles || []
  const permissions = [...new Set(roles.flatMap((role) => rolePermissions[role] || []))]
  return { roles, permissions }
}

function roleToGroup(roleName = 'Usuario') {
  if (roleName === 'Administrador') return 'Administradores'
  if (roleName === 'Editor') return 'Editores'
  return 'Usuarios'
}

function normalizeRole(roleName = 'Usuario') {
  const allowed = ['Editor', 'Usuario']
  return allowed.includes(roleName) ? roleName : 'Usuario'
}

function safeDate(value) {
  return value ? new Date(value).toISOString() : null
}

async function countDbAdmins() {
  const rows = await getRows(
    `SELECT COUNT(DISTINCT u.id)::int AS total
     FROM usuarios u
     INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
     INNER JOIN roles r ON r.id = ur.rol_id
     WHERE r.nombre = 'Administrador' AND u.activo = true`,
  )
  return rows[0]?.total || 0
}

async function userHasRole(userId, roleName) {
  const rows = await getRows(
    `SELECT 1
     FROM usuario_rol ur
     INNER JOIN roles r ON r.id = ur.rol_id
     WHERE ur.usuario_id = $1 AND r.nombre = $2
     LIMIT 1`,
    [userId, roleName],
  )
  return rows.length > 0
}

async function createDbSession(userId) {
  const rawToken = createToken()
  await pool.query(
    'INSERT INTO sesiones (usuario_id, token_hash, expira_en) VALUES ($1, $2, $3)',
    [userId, tokenHash(rawToken), expiresAt()],
  )
  return rawToken
}

function createMemorySession(userId) {
  const rawToken = createToken()
  memory.sessions.push({ userId, tokenHash: tokenHash(rawToken), revoked: false, expiresAt: expiresAt().toISOString() })
  return rawToken
}

async function authRequired(req, res, next) {
  const rawToken = extractBearer(req)
  if (!rawToken) {
    return res.status(401).json({ ok: false, message: 'Sesión requerida. Inicia sesión para continuar.' })
  }

  const hash = tokenHash(rawToken)

  if (!pool) {
    const session = memory.sessions.find((item) => item.tokenHash === hash && !item.revoked && new Date(item.expiresAt) > new Date())
    if (!session) return res.status(401).json({ ok: false, message: 'Sesión inválida o expirada.' })
    const user = memory.users.find((item) => item.id === session.userId && item.active)
    if (!user) return res.status(401).json({ ok: false, message: 'Usuario no disponible.' })
    const access = loadMemoryUserAccess(user.id)
    req.auth = { user, ...access, tokenHash: hash }
    return next()
  }

  try {
    const rows = await getRows(
      `SELECT u.id, u.nombre, u.nombres, u.apellidos, u.telefono, u.email, u.activo, u.requiere_cambio_password, u.grupo_sistema, u.creado_en, u.ultimo_login
       FROM sesiones s
       INNER JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token_hash = $1 AND s.revocada = false AND s.expira_en > NOW() AND u.activo = true
       LIMIT 1`,
      [hash],
    )

    if (!rows.length) return res.status(401).json({ ok: false, message: 'Sesión inválida o expirada.' })

    const user = rows[0]
    const access = await loadDbUserAccess(user.id)
    req.auth = { user, ...access, tokenHash: hash }
    return next()
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'No se pudo validar la sesión.', detail: error.message })
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.auth?.permissions?.includes(permission)) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para acceder a este recurso.' })
    }
    return next()
  }
}

app.get('/api/health', async (req, res) => {
  let database = 'not_configured'

  if (pool) {
    try {
      await pool.query('SELECT 1')
      database = 'connected'
    } catch {
      database = 'connection_error'
    }
  }

  res.json({ ok: true, service: 'Luma Express Backend', database })
})

app.get('/api/content', async (req, res) => {
  if (!pool) {
    return res.json({ ok: true, source: 'local_static_data', products, categories, ingredients, posts })
  }

  try {
    const [dbProducts, dbPosts] = await Promise.all([
      getRows('SELECT id, name, category, goal, tag, description, image, ingredients FROM products WHERE is_active = true ORDER BY id ASC'),
      getRows('SELECT id, category, published_date AS date, read_time AS read, title, summary, image FROM blog_posts WHERE is_active = true ORDER BY id ASC'),
    ])

    res.json({
      ok: true,
      source: 'postgresql',
      products: dbProducts.length ? dbProducts : products,
      categories,
      ingredients,
      posts: dbPosts.length ? dbPosts : posts,
    })
  } catch (error) {
    res.json({ ok: true, source: 'local_static_data_fallback', products, categories, ingredients, posts, warning: error.message })
  }
})

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body

  if (!hasValidEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Correo inválido' })
  }

  if (!pool) {
    memory.newsletter.push({ email, createdAt: new Date().toISOString() })
    return res.json({ ok: true, message: 'Suscripción registrada en memoria local' })
  }

  try {
    await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email],
    )
    res.json({ ok: true, message: 'Suscripción registrada en PostgreSQL' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo guardar la suscripción', detail: error.message })
  }
})

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, skinType, topic, message } = req.body

  if (!name?.trim() || !hasValidEmail(email) || !message?.trim()) {
    return res.status(400).json({ ok: false, message: 'Datos incompletos' })
  }

  if (!pool) {
    memory.contacts.push({ name, email, phone, skinType, topic, message, createdAt: new Date().toISOString() })
    return res.json({ ok: true, message: 'Mensaje recibido en memoria local' })
  }

  try {
    await pool.query(
      `INSERT INTO contacts (name, email, phone, skin_type, topic, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, email, phone || '', skinType || '', topic || '', message],
    )
    res.json({ ok: true, message: 'Mensaje recibido en PostgreSQL' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo guardar el mensaje', detail: error.message })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const firstName = String(req.body.firstName || '').trim()
  const lastName = String(req.body.lastName || '').trim()
  const phone = String(req.body.phone || '').trim()
  const name = String(req.body.name || `${firstName} ${lastName}`).trim()
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')

  if (!name || !hasValidEmail(email) || !hasStrongPassword(password)) {
    return res.status(400).json({
      ok: false,
      message: 'Datos inválidos. La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
    })
  }

  if (!pool) {
    const exists = memory.users.some((user) => user.email === email)
    if (exists) return res.status(409).json({ ok: false, message: 'El correo ya está registrado.' })
    const user = {
      id: memory.nextUserId++,
      name,
      email,
      passwordHash: hashPassword(password),
      active: true,
      roles: ['Usuario'],
      requiresPasswordChange: false,
      group: 'Usuarios',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }
    memory.users.push(user)
    const token = createMemorySession(user.id)
    const access = loadMemoryUserAccess(user.id)
    return res.status(201).json({ ok: true, message: 'Usuario registrado.', token, user: publicUser(user, access.roles, access.permissions) })
  }

  try {
    await ensureAuthCatalog()
    const roleName = 'Usuario'
    const passwordHash = hashPassword(password)

    const inserted = await pool.query(
      `INSERT INTO usuarios (nombre, nombres, apellidos, telefono, email, password_hash, requiere_cambio_password, grupo_sistema)
       VALUES ($1, $2, $3, $4, $5, $6, false, 'Usuarios')
       RETURNING id, nombre, nombres, apellidos, telefono, email, activo, requiere_cambio_password, grupo_sistema, creado_en, ultimo_login`,
      [name, firstName || null, lastName || null, phone || null, email, passwordHash],
    )
    const user = inserted.rows[0]

    await pool.query(
      `INSERT INTO usuario_rol (usuario_id, rol_id)
       SELECT $1, id FROM roles WHERE nombre = $2
       ON CONFLICT DO NOTHING`,
      [user.id, roleName],
    )

    const token = await createDbSession(user.id)
    const access = await loadDbUserAccess(user.id)
    res.status(201).json({ ok: true, message: 'Usuario registrado.', token, user: publicUser(user, access.roles, access.permissions) })
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ ok: false, message: 'El correo ya está registrado.' })
    res.status(500).json({ ok: false, message: 'No se pudo registrar el usuario.', detail: error.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')

  if (!hasValidEmail(email) || !password) {
    return res.status(400).json({ ok: false, message: 'Correo o contraseña inválidos.' })
  }

  if (!pool) {
    const user = memory.users.find((item) => item.email === email)
    if (user && !user.active) {
      return res.status(403).json({ ok: false, message: 'Tu cuenta está deshabilitada. Contacta al administrador para recuperar el acceso.' })
    }
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' })
    }
    user.lastLogin = new Date().toISOString()
    const token = createMemorySession(user.id)
    const access = loadMemoryUserAccess(user.id)
    return res.json({ ok: true, message: 'Inicio de sesión correcto.', token, user: publicUser(user, access.roles, access.permissions) })
  }

  try {
    const rows = await getRows('SELECT id, nombre, nombres, apellidos, telefono, email, password_hash, activo, requiere_cambio_password, grupo_sistema, creado_en, ultimo_login FROM usuarios WHERE email = $1 LIMIT 1', [email])
    const user = rows[0]
    if (user && !user.activo) {
      return res.status(403).json({ ok: false, message: 'Tu cuenta está deshabilitada. Contacta al administrador para recuperar el acceso.' })
    }
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas.' })
    }

    await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [user.id])
    user.ultimo_login = new Date().toISOString()
    const token = await createDbSession(user.id)
    const access = await loadDbUserAccess(user.id)
    res.json({ ok: true, message: 'Inicio de sesión correcto.', token, user: publicUser(user, access.roles, access.permissions) })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo iniciar sesión.', detail: error.message })
  }
})

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ ok: true, user: publicUser(req.auth.user, req.auth.roles, req.auth.permissions) })
})

app.patch('/api/auth/profile', authRequired, async (req, res) => {
  const firstName = String(req.body.firstName || '').trim()
  const lastName = String(req.body.lastName || '').trim()
  const phone = String(req.body.phone || '').trim()
  const name = String(req.body.name || `${firstName} ${lastName}` || req.auth.user.nombre || req.auth.user.name || '').trim()

  if (!name) {
    return res.status(400).json({ ok: false, message: 'El nombre no puede quedar vacío.' })
  }

  if (!pool) {
    const user = memory.users.find((item) => item.id === req.auth.user.id)
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' })
    user.name = name
    user.firstName = firstName
    user.lastName = lastName
    user.phone = phone
    const access = loadMemoryUserAccess(user.id)
    return res.json({ ok: true, message: 'Perfil actualizado correctamente.', user: publicUser(user, access.roles, access.permissions) })
  }

  try {
    const updated = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, nombres = $2, apellidos = $3, telefono = $4
       WHERE id = $5
       RETURNING id, nombre, nombres, apellidos, telefono, email, activo, requiere_cambio_password, grupo_sistema, creado_en, ultimo_login`,
      [name, firstName || null, lastName || null, phone || null, req.auth.user.id],
    )
    const access = await loadDbUserAccess(req.auth.user.id)
    res.json({ ok: true, message: 'Perfil actualizado correctamente.', user: publicUser(updated.rows[0], access.roles, access.permissions) })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo actualizar el perfil.', detail: error.message })
  }
})

app.post('/api/auth/logout', authRequired, async (req, res) => {
  if (!pool) {
    const session = memory.sessions.find((item) => item.tokenHash === req.auth.tokenHash)
    if (session) session.revoked = true
    return res.json({ ok: true, message: 'Sesión cerrada.' })
  }

  try {
    await pool.query('UPDATE sesiones SET revocada = true WHERE token_hash = $1', [req.auth.tokenHash])
    res.json({ ok: true, message: 'Sesión cerrada.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo cerrar sesión.', detail: error.message })
  }
})


app.get('/api/admin/users', authRequired, requirePermission('users:read'), async (req, res) => {
  if (!pool) {
    return res.json({
      ok: true,
      source: 'local_memory',
      users: memory.users.map((user) => ({
        ...publicUser(user, user.roles, loadMemoryUserAccess(user.id).permissions),
        nombre: user.name,
        email: user.email,
        activo: user.active,
        creado_en: user.createdAt,
        ultimo_login: user.lastLogin,
        requiere_cambio_password: user.requiresPasswordChange,
        grupo_sistema: user.group,
      })),
    })
  }

  try {
    const users = await getRows(
      `SELECT u.id, u.nombre, u.nombres, u.apellidos, u.telefono, u.email, u.activo, u.creado_en, u.ultimo_login,
              u.requiere_cambio_password, u.grupo_sistema,
              COALESCE(json_agg(r.nombre ORDER BY r.nombre) FILTER (WHERE r.id IS NOT NULL), '[]') AS roles
       FROM usuarios u
       LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id
       LEFT JOIN roles r ON r.id = ur.rol_id
       GROUP BY u.id
       ORDER BY u.id ASC`,
    )
    res.json({ ok: true, source: 'postgresql', users })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudieron consultar los usuarios.', detail: error.message })
  }
})

app.post('/api/admin/users', authRequired, requirePermission('users:manage'), async (req, res) => {
  const firstName = String(req.body.firstName || '').trim()
  const lastName = String(req.body.lastName || '').trim()
  const phone = String(req.body.phone || '').trim()
  const name = String(req.body.name || `${firstName} ${lastName}`).trim()
  const email = normalizeEmail(req.body.email)
  const password = String(req.body.password || '')
  const roleName = normalizeRole(req.body.role)
  const requiresPasswordChange = Boolean(req.body.requiresPasswordChange)
  const group = roleToGroup(roleName)

  if (!name || !hasValidEmail(email) || !hasStrongPassword(password)) {
    return res.status(400).json({ ok: false, message: 'Datos inválidos. Usa nombre, correo válido y contraseña con mínimo 8 caracteres, una mayúscula, una minúscula y un número.' })
  }

  if (!pool) {
    if (memory.users.some((user) => user.email === email)) return res.status(409).json({ ok: false, message: 'El correo ya está registrado.' })
    const user = {
      id: memory.nextUserId++, name, email, passwordHash: hashPassword(password), active: true,
      roles: [roleName], requiresPasswordChange, group, createdAt: new Date().toISOString(), lastLogin: null,
    }
    memory.users.push(user)
    return res.status(201).json({ ok: true, message: `Usuario ${name} creado con rol ${roleName}.`, user })
  }

  try {
    await ensureAuthCatalog()
    const inserted = await pool.query(
      `INSERT INTO usuarios (nombre, nombres, apellidos, telefono, email, password_hash, activo, requiere_cambio_password, grupo_sistema)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8)
       RETURNING id, nombre, nombres, apellidos, telefono, email, activo, creado_en, ultimo_login, requiere_cambio_password, grupo_sistema`,
      [name, firstName || null, lastName || null, phone || null, email, hashPassword(password), requiresPasswordChange, group],
    )

    await pool.query(
      `INSERT INTO usuario_rol (usuario_id, rol_id)
       SELECT $1, id FROM roles WHERE nombre = $2
       ON CONFLICT DO NOTHING`,
      [inserted.rows[0].id, roleName],
    )

    res.status(201).json({ ok: true, message: `Usuario ${name} creado con rol ${roleName}.`, user: inserted.rows[0] })
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ ok: false, message: 'El correo ya está registrado.' })
    res.status(500).json({ ok: false, message: 'No se pudo crear el usuario.', detail: error.message })
  }
})

app.post('/api/admin/users/practice-seed', authRequired, requirePermission('users:manage'), async (req, res) => {
  const practiceUsers = [
    { name: 'Alumno Uno', email: 'alumno1@luma.local', role: 'Editor', group: 'Editores' },
    { name: 'Alumno Dos', email: 'alumno2@luma.local', role: 'Editor', group: 'Editores' },
    { name: 'Usuario Invitado', email: 'invitado@luma.local', role: 'Usuario', group: 'Usuarios' },
  ]
  const password = 'Alumno1234'

  if (!pool) {
    for (const item of practiceUsers) {
      if (!memory.users.some((user) => user.email === item.email)) {
        memory.users.push({
          id: memory.nextUserId++, name: item.name, email: item.email, passwordHash: hashPassword(password), active: true,
          roles: [item.role], requiresPasswordChange: true, group: item.group, createdAt: new Date().toISOString(), lastLogin: null,
        })
      }
    }
    return res.json({ ok: true, message: 'Usuarios de práctica creados en memoria local. Contraseña: Alumno1234' })
  }

  try {
    await ensureAuthCatalog()
    for (const item of practiceUsers) {
      const inserted = await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, activo, requiere_cambio_password, grupo_sistema)
         VALUES ($1, $2, $3, true, true, $4)
         ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, grupo_sistema = EXCLUDED.grupo_sistema
         RETURNING id`,
        [item.name, item.email, hashPassword(password), item.group],
      )
      await pool.query(
        `INSERT INTO usuario_rol (usuario_id, rol_id)
         SELECT $1, id FROM roles WHERE nombre = $2
         ON CONFLICT DO NOTHING`,
        [inserted.rows[0].id, item.role],
      )
    }
    res.json({ ok: true, message: 'Usuarios de práctica creados/actualizados. Contraseña común: Alumno1234' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudieron crear los usuarios de práctica.', detail: error.message })
  }
})

app.patch('/api/admin/users/:id/status', authRequired, requirePermission('users:manage'), async (req, res) => {
  const userId = Number(req.params.id)
  const active = Boolean(req.body.active)
  if (!Number.isInteger(userId)) return res.status(400).json({ ok: false, message: 'Usuario inválido.' })
  if (req.auth.user.id === userId && !active) return res.status(400).json({ ok: false, message: 'No puedes deshabilitar tu propia cuenta activa.' })

  if (!pool) {
    const user = memory.users.find((item) => item.id === userId)
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' })
    user.active = active
    return res.json({ ok: true, message: active ? 'Usuario habilitado.' : 'Usuario deshabilitado.' })
  }

  try {
    if (!active && await userHasRole(userId, 'Administrador') && await countDbAdmins() <= 1) {
      return res.status(400).json({ ok: false, message: 'No se puede deshabilitar al único administrador activo.' })
    }
    await pool.query('UPDATE usuarios SET activo = $1 WHERE id = $2', [active, userId])
    await pool.query('UPDATE sesiones SET revocada = true WHERE usuario_id = $1 AND $2 = false', [userId, active])
    res.json({ ok: true, message: active ? 'Usuario habilitado.' : 'Usuario deshabilitado. Sus sesiones activas fueron revocadas.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo cambiar el estado del usuario.', detail: error.message })
  }
})

app.patch('/api/admin/users/:id/password-change', authRequired, requirePermission('users:manage'), async (req, res) => {
  const userId = Number(req.params.id)
  const requiresPasswordChange = Boolean(req.body.requiresPasswordChange)
  if (!Number.isInteger(userId)) return res.status(400).json({ ok: false, message: 'Usuario inválido.' })

  if (!pool) {
    const user = memory.users.find((item) => item.id === userId)
    if (!user) return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' })
    user.requiresPasswordChange = requiresPasswordChange
    return res.json({ ok: true, message: requiresPasswordChange ? 'Se solicitó cambio de contraseña.' : 'Se quitó la solicitud de cambio de contraseña.' })
  }

  try {
    await pool.query('UPDATE usuarios SET requiere_cambio_password = $1 WHERE id = $2', [requiresPasswordChange, userId])
    res.json({ ok: true, message: requiresPasswordChange ? 'Se solicitó cambio de contraseña.' : 'Se quitó la solicitud de cambio de contraseña.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo actualizar la propiedad de contraseña.', detail: error.message })
  }
})

app.delete('/api/admin/users/:id', authRequired, requirePermission('users:manage'), async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isInteger(userId)) return res.status(400).json({ ok: false, message: 'Usuario inválido.' })
  if (req.auth.user.id === userId) return res.status(400).json({ ok: false, message: 'No puedes eliminar tu propia cuenta.' })

  if (!pool) {
    const index = memory.users.findIndex((item) => item.id === userId)
    if (index === -1) return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' })
    const user = memory.users[index]
    if (user.roles?.includes('Administrador')) return res.status(400).json({ ok: false, message: 'No se permite eliminar administradores desde esta práctica.' })
    memory.users.splice(index, 1)
    return res.json({ ok: true, message: 'Usuario eliminado. En un caso real se recomienda deshabilitar para conservar auditoría.' })
  }

  try {
    if (await userHasRole(userId, 'Administrador')) {
      return res.status(400).json({ ok: false, message: 'No se permite eliminar administradores desde esta práctica.' })
    }
    await pool.query('DELETE FROM usuarios WHERE id = $1', [userId])
    res.json({ ok: true, message: 'Usuario eliminado. En un caso real se recomienda deshabilitar para conservar auditoría.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo eliminar el usuario.', detail: error.message })
  }
})


app.get('/api/admin/messages', authRequired, requirePermission('messages:read'), async (req, res) => {
  if (!pool) {
    return res.json({ ok: true, source: 'local_memory', contacts: memory.contacts })
  }

  try {
    const rows = await getRows('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50')
    res.json({ ok: true, source: 'postgresql', contacts: rows })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudieron consultar los mensajes', detail: error.message })
  }
})

function normalizeContentType(type = '') {
  return type === 'post' || type === 'blog' || type === 'article' ? 'post' : 'product'
}

async function readAdminContent() {
  if (!pool) return { products, posts }
  const dbProducts = await getRows('SELECT id, name, category, goal, tag, description, image, ingredients, is_active FROM products ORDER BY id ASC')
  const dbPosts = await getRows('SELECT id, category, published_date AS date, read_time AS read, title, summary, image, is_active FROM blog_posts ORDER BY id ASC')
  return {
    products: dbProducts.length ? dbProducts : products.map((item) => ({ ...item, is_active: true })),
    posts: dbPosts.length ? dbPosts : posts.map((item) => ({ ...item, is_active: true })),
  }
}

app.get('/api/admin/content', authRequired, requirePermission('content:read'), async (req, res) => {
  try {
    const content = await readAdminContent()
    res.json({ ok: true, ...content, categories, ingredients })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo consultar el contenido.', detail: error.message })
  }
})

app.post('/api/admin/content/items', authRequired, requirePermission('content:manage'), async (req, res) => {
  const type = normalizeContentType(req.body.type)
  const category = String(req.body.category || 'General').trim()
  const image = String(req.body.image || (type === 'post' ? '/images/blog-routines.svg' : '/images/product-set.jpg')).trim()

  if (!pool) return res.json({ ok: true, message: 'Contenido validado en modo memoria. Con PostgreSQL se guarda permanentemente.' })

  try {
    if (type === 'post') {
      const title = String(req.body.title || '').trim()
      const summary = String(req.body.summary || req.body.description || '').trim()
      if (!title || !summary) return res.status(400).json({ ok: false, message: 'Título y resumen son obligatorios.' })
      const inserted = await pool.query(
        `INSERT INTO blog_posts (category, published_date, read_time, title, summary, image, is_active)
         VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, true)
         RETURNING id`,
        [category, String(req.body.read || '4 min lectura'), title, summary, image],
      )
      return res.status(201).json({ ok: true, message: 'Artículo agregado correctamente.', id: inserted.rows[0].id })
    }

    const name = String(req.body.name || req.body.title || '').trim()
    const description = String(req.body.description || '').trim()
    if (!name || !description) return res.status(400).json({ ok: false, message: 'Nombre y descripción son obligatorios.' })
    const inserted = await pool.query(
      `INSERT INTO products (name, category, goal, tag, description, image, ingredients, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id`,
      [name, category, String(req.body.goal || ''), String(req.body.tag || category), description, image, Array.isArray(req.body.ingredients) ? req.body.ingredients : []],
    )
    res.status(201).json({ ok: true, message: 'Producto agregado correctamente.', id: inserted.rows[0].id })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo guardar el contenido.', detail: error.message })
  }
})

app.patch('/api/admin/content/items/:type/:id', authRequired, requirePermission('content:manage'), async (req, res) => {
  const type = normalizeContentType(req.params.type)
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, message: 'Contenido inválido.' })
  if (!pool) return res.json({ ok: true, message: 'Edición simulada en modo memoria.' })

  try {
    if (type === 'post') {
      await pool.query(
        `UPDATE blog_posts SET category = $1, title = $2, summary = $3, image = $4, read_time = $5 WHERE id = $6`,
        [String(req.body.category || 'General'), String(req.body.title || ''), String(req.body.summary || req.body.description || ''), String(req.body.image || '/images/blog-routines.svg'), String(req.body.read || '4 min lectura'), id],
      )
      return res.json({ ok: true, message: 'Artículo actualizado correctamente.' })
    }

    await pool.query(
      `UPDATE products SET name = $1, category = $2, goal = $3, tag = $4, description = $5, image = $6 WHERE id = $7`,
      [String(req.body.name || req.body.title || ''), String(req.body.category || 'General'), String(req.body.goal || ''), String(req.body.tag || req.body.category || 'General'), String(req.body.description || ''), String(req.body.image || '/images/product-set.jpg'), id],
    )
    res.json({ ok: true, message: 'Producto actualizado correctamente.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo actualizar el contenido.', detail: error.message })
  }
})

app.patch('/api/admin/content/items/:type/:id/visibility', authRequired, requirePermission('content:manage'), async (req, res) => {
  const type = normalizeContentType(req.params.type)
  const id = Number(req.params.id)
  const active = Boolean(req.body.active)
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, message: 'Contenido inválido.' })
  if (!pool) return res.json({ ok: true, message: active ? 'Contenido mostrado.' : 'Contenido ocultado.' })

  try {
    await pool.query(`UPDATE ${type === 'post' ? 'blog_posts' : 'products'} SET is_active = $1 WHERE id = $2`, [active, id])
    res.json({ ok: true, message: active ? 'Contenido visible en el sitio.' : 'Contenido oculto del sitio.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo cambiar la visibilidad.', detail: error.message })
  }
})

app.delete('/api/admin/content/items/:type/:id', authRequired, requirePermission('content:manage'), async (req, res) => {
  const type = normalizeContentType(req.params.type)
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, message: 'Contenido inválido.' })
  if (!pool) return res.json({ ok: true, message: 'Contenido eliminado en modo memoria.' })

  try {
    await pool.query(`DELETE FROM ${type === 'post' ? 'blog_posts' : 'products'} WHERE id = $1`, [id])
    res.json({ ok: true, message: 'Contenido eliminado correctamente.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo eliminar el contenido.', detail: error.message })
  }
})

app.post('/api/admin/content/demo-post', authRequired, requirePermission('content:manage'), async (req, res) => {
  const title = String(req.body.title || '').trim()
  if (!title) return res.status(400).json({ ok: false, message: 'El título es obligatorio.' })
  if (!pool) return res.json({ ok: true, message: 'El editor tiene permiso para crear contenido. Demo en memoria local.' })

  try {
    await pool.query(
      `INSERT INTO blog_posts (category, published_date, read_time, title, summary, image, is_active)
       VALUES ('EDITOR', CURRENT_DATE, '3 min lectura', $1, 'Entrada generada desde el módulo protegido por permisos.', '/images/blog-routines.svg', true)`,
      [title],
    )
    res.json({ ok: true, message: 'Contenido creado desde módulo protegido.' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo crear el contenido.', detail: error.message })
  }
})



app.get('/api/admin/overview', authRequired, requirePermission('dashboard:view'), async (req, res) => {
  if (!pool) {
    return res.json({
      ok: true,
      source: 'local_memory',
      metrics: {
        users: memory.users.length,
        admins: memory.users.filter((user) => user.roles?.includes('Administrador')).length,
        contacts: memory.contacts.length,
        newsletter: memory.newsletter.length,
        products: products.length,
        posts: posts.length,
      },
      activity: memory.contacts.slice(-5).reverse().map((contact, index) => ({
        id: index + 1,
        title: contact.topic || 'Nuevo mensaje',
        detail: `${contact.name} · ${contact.email}`,
        date: contact.createdAt,
      })),
    })
  }

  try {
    const [usersCount, adminsCount, contactsCount, newsletterCount, productsCount, postsCount, recentContacts] = await Promise.all([
      getRows('SELECT COUNT(*)::int AS total FROM usuarios'),
      getRows(`SELECT COUNT(DISTINCT u.id)::int AS total FROM usuarios u INNER JOIN usuario_rol ur ON ur.usuario_id = u.id INNER JOIN roles r ON r.id = ur.rol_id WHERE r.nombre = 'Administrador'`),
      getRows('SELECT COUNT(*)::int AS total FROM contacts'),
      getRows('SELECT COUNT(*)::int AS total FROM newsletter_subscribers'),
      getRows('SELECT COUNT(*)::int AS total FROM products WHERE is_active = true'),
      getRows('SELECT COUNT(*)::int AS total FROM blog_posts WHERE is_active = true'),
      getRows('SELECT id, name, email, topic, created_at FROM contacts ORDER BY created_at DESC LIMIT 5'),
    ])

    res.json({
      ok: true,
      source: 'postgresql',
      metrics: {
        users: usersCount[0].total,
        admins: adminsCount[0].total,
        contacts: contactsCount[0].total,
        newsletter: newsletterCount[0].total,
        products: productsCount[0].total,
        posts: postsCount[0].total,
      },
      activity: recentContacts.map((contact) => ({
        id: contact.id,
        title: contact.topic || 'Nuevo mensaje',
        detail: `${contact.name} · ${contact.email}`,
        date: contact.created_at,
      })),
    })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo cargar el resumen del panel.', detail: error.message })
  }
})

async function start() {
  if (pool) {
    try {
      await ensureAuthCatalog()
      await ensureDefaultContent()
      console.log('Auth catalog verified')
    } catch (error) {
      console.log('Auth catalog pending. Run database/schema.sql first.', error.message)
    }
  }


  app.listen(port, () => {
    console.log(`Luma backend running on http://localhost:${port}`)
    console.log(pool ? 'PostgreSQL mode enabled' : 'PostgreSQL not configured: using local memory fallback')
  })
}

start()
