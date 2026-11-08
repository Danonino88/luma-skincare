# Seguridad V6.3

## Autorización
Las rutas privadas usan `authRequired`, validan `Authorization: Bearer <token>` contra `public.sesiones` y comprueban que la sesión no esté revocada, no haya expirado y que el usuario esté activo.

Rutas públicas intencionales: `/api/health`, `/api/luma/health`, `/api/content`, `/api/newsletter`, `/api/contact`, `/api/auth/login`, `/api/auth/register`.

Rutas privadas: `/api/auth/me`, `/api/auth/profile`, `/api/auth/logout`, `/api/admin/*` y todas las rutas de datos Luma (`/api/luma/weather`, dispositivos, rutina, adherencia, snapshots, recordatorios y preferencias).

## Validación
Las entradas se normalizan y se validan antes de llegar a PostgreSQL. Se restringen correos, tamaños de texto, UUIDs, IDs de dispositivos, periodos, fechas y rangos numéricos.

## Errores
Los clientes reciben mensajes genéricos. `error.message`, stack traces y detalles de PostgreSQL se escriben únicamente en logs del servidor.

## Pruebas
`npm test` incluye pruebas de autenticación, permisos, entradas inválidas, JSON mal formado y acceso sin token.
