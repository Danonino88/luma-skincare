import 'dotenv/config'
import crypto from 'node:crypto'
import pg from 'pg'

const { Pool } = pg

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

const args = process.argv.slice(2)
const getArg = (name, fallback = '') => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] || fallback : fallback
}

const name = getArg('name', 'Administrador Luma').trim()
const email = getArg('email', '').trim().toLowerCase()
const password = getArg('password', '')
const databaseUrl = process.env.DATABASE_URL

const hasValidEmail = (value = '') => /\S+@\S+\.\S+/.test(value)
const hasStrongPassword = (value = '') => value.length >= 8 && /[A-ZÁÉÍÓÚÑ]/.test(value) && /[a-záéíóúñ]/.test(value) && /\d/.test(value)

function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(value, salt, 64).toString('hex')
  return `scrypt$16384$8$1$${salt}$${hash}`
}

async function ensureAuthCatalog(pool) {
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

if (!databaseUrl) {
  console.error('Falta DATABASE_URL en backend/.env')
  process.exit(1)
}

if (!hasValidEmail(email) || !hasStrongPassword(password)) {
  console.error('Uso: npm run admin:create -- --name "Administrador Luma" --email admin@luma.com --password Admin1234')
  console.error('La contraseña requiere mínimo 8 caracteres, una mayúscula, una minúscula y un número.')
  process.exit(1)
}

const pool = new Pool({ connectionString: databaseUrl })

try {
  await ensureAuthCatalog(pool)

  const existingAdmin = await pool.query(
    `SELECT u.id, u.email
     FROM usuarios u
     INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
     INNER JOIN roles r ON r.id = ur.rol_id
     WHERE r.nombre = 'Administrador'
     LIMIT 1`,
  )

  if (existingAdmin.rows.length && existingAdmin.rows[0].email !== email) {
    console.log(`Ya existe un administrador: ${existingAdmin.rows[0].email}`)
    console.log('No se creó otro administrador para evitar accesos duplicados.')
    process.exit(0)
  }

  const passwordHash = hashPassword(password)
  const inserted = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, activo, requiere_cambio_password, grupo_sistema)
     VALUES ($1, $2, $3, true, false, 'Administradores')
     ON CONFLICT (email) DO UPDATE SET
       nombre = EXCLUDED.nombre,
       password_hash = EXCLUDED.password_hash,
       activo = true,
       requiere_cambio_password = false,
       grupo_sistema = 'Administradores'
     RETURNING id, email`,
    [name, email, passwordHash],
  )

  await pool.query(
    `INSERT INTO usuario_rol (usuario_id, rol_id)
     SELECT $1, id FROM roles WHERE nombre = 'Administrador'
     ON CONFLICT DO NOTHING`,
    [inserted.rows[0].id],
  )

  console.log(`Administrador listo: ${inserted.rows[0].email}`)
  console.log('Guarda estas credenciales fuera del proyecto. No deben ir en .env ni en GitHub.')
} catch (error) {
  console.error('No se pudo crear el administrador:', error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
