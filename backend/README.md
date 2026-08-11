# Backend Luma v17

Servidor Express con PostgreSQL para formularios, autenticación, sesiones, roles, permisos y administración de cuentas.

## Configuración

Copia `.env.example` como `.env` y coloca tu conexión local:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/luma_skincare
SESSION_DAYS=7
```

No guardes credenciales de administrador en `.env`.

## Importar base de datos

```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d luma_skincare -f "C:\projects\luma-skincare-profesional-v17\backend\database\schema.sql"
```

## Crear administrador inicial

Ejecuta una sola vez:

```powershell
npm run admin:create -- --name "Administrador Luma" --email "admin@luma.com" --password "Admin1234"
```

El comando crea o actualiza esa cuenta como Administrador y asigna los permisos correspondientes. Después ya puedes iniciar sesión desde el frontend.

## Levantar servidor

```powershell
npm install
npm run server
```

API local:

```txt
http://localhost:4000
```
