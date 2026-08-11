CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(40),
  skin_type VARCHAR(80),
  topic VARCHAR(120),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL,
  goal VARCHAR(160),
  tag VARCHAR(80),
  description TEXT NOT NULL,
  image VARCHAR(255),
  ingredients TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  published_date VARCHAR(80),
  read_time VARCHAR(80),
  title VARCHAR(220) NOT NULL,
  summary TEXT NOT NULL,
  image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prácticas 9 y 10: autenticación, roles y permisos
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nombres VARCHAR(80),
  apellidos VARCHAR(120),
  telefono VARCHAR(40),
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  requiere_cambio_password BOOLEAN NOT NULL DEFAULT FALSE,
  grupo_sistema VARCHAR(80) NOT NULL DEFAULT 'Usuarios',
  ultimo_login TIMESTAMP,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permisos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario_rol (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS rol_permiso (
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rol_id, permiso_id)
);

CREATE TABLE IF NOT EXISTS sesiones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TIMESTAMP NOT NULL,
  revocada BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_hash ON sesiones(token_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones(usuario_id);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombres VARCHAR(80);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos VARCHAR(120);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(40);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS requiere_cambio_password BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS grupo_sistema VARCHAR(80) NOT NULL DEFAULT 'Usuarios';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;


INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total de usuarios, contenido, mensajes y configuración.'),
('Editor', 'Administración de contenido informativo del sitio.'),
('Usuario', 'Acceso a perfil, consulta de contenido y recursos personalizados.')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

INSERT INTO permisos (codigo, descripcion) VALUES
('dashboard:view', 'Puede entrar al panel protegido.'),
('users:read', 'Puede consultar usuarios registrados.'),
('users:manage', 'Puede administrar usuarios, roles y estado de cuentas.'),
('content:read', 'Puede consultar contenido administrativo.'),
('content:manage', 'Puede crear o editar contenido del sitio.'),
('messages:read', 'Puede revisar mensajes del formulario de contacto.'),
('profile:read', 'Puede consultar su propio perfil.')
ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Editor'
AND p.codigo IN ('dashboard:view', 'content:read', 'content:manage', 'messages:read', 'profile:read')
ON CONFLICT DO NOTHING;

INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Usuario'
AND p.codigo IN ('dashboard:view', 'content:read', 'profile:read')
ON CONFLICT DO NOTHING;
