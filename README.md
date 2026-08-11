# Luma Skincare Profesional v19

Versión con ajustes finales del dashboard y módulos internos.

## Cambios principales

- El menú lateral del dashboard queda fijo y completo al hacer scroll.
- La vista "Resumen" ahora se llama "Dashboard".
- La gráfica de actividad ahora muestra los datos que está comparando: usuarios, mensajes, productos, artículos y administradores.
- El perfil del administrador, editor y usuario permite editar datos personales.
- El módulo de contenido permite agregar, editar, eliminar, ocultar y desocultar productos y artículos.
- El módulo de mensajes muestra una tabla con: nombre, correo, mensaje y fecha.
- Se mejoró el perfil y la estructura interna del usuario.
- El backend incluye endpoint de actualización de perfil y endpoints CRUD para contenido.
- El backend mantiene separación profesional: API principal, creación única de administrador, schema SQL y variables de entorno.

## Ejecutar backend

```powershell
cd "C:\projects\luma-skincare-profesional-v19\backend"
npm install
npm run server
```

## Ejecutar frontend

```powershell
cd "C:\projects\luma-skincare-profesional-v19\frontend"
npm install
npm run dev
```

## Configuración local

Crear `backend/.env` con:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:123456@localhost:5432/luma_skincare
SESSION_DAYS=7
```

## Crear administrador una sola vez

```powershell
cd "C:\projects\luma-skincare-profesional-v19\backend"
npm run admin:create -- --name "Administrador Luma" --email "admin@luma.com" --password "Admin1234"
```

## Importar schema

En CMD:

```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d luma_skincare -f "C:\projects\luma-skincare-profesional-v19\backend\database\schema.sql"
```
