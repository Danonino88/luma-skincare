# Luma Skincare — Backend V6 Wear/Mobile

Esta carpeta es una copia del repositorio web con el backend extendido para reloj y app móvil. El frontend no requiere cambios para V6.

## Render actual

- Branch: `main`
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm run server`
- Auto Deploy: On Commit

## Variables de Render

Conserva:

- `DATABASE_URL`
- `FRONTEND_ORIGIN=https://luma-skincare.vercel.app`
- `SESSION_DAYS=7`

Opcional para mayor precisión meteorológica:

- `GOOGLE_WEATHER_API_KEY`

Si no se configura Google Weather, `/api/luma/weather` usa Open-Meteo automáticamente.

## Nuevas rutas

- `GET /api/luma/health`
- `GET /api/luma/weather?lat=...&lng=...`
- `POST /api/luma/devices/ping` (Bearer)
- `POST /api/luma/routine-events` (Bearer)
- `GET /api/luma/routine-state` (Bearer)
- `GET /api/luma/adherence?days=7` (Bearer)
- `POST /api/luma/weather-snapshots` (Bearer)
- `POST /api/luma/reminders` (Bearer)
- `GET /api/luma/preferences` (Bearer)
- `PATCH /api/luma/preferences` (Bearer)

La autenticación reutiliza `/api/auth/login`, `public.usuarios` y `public.sesiones` existentes.

## Base de datos

El backend ejecuta `CREATE TABLE IF NOT EXISTS` al arrancar. También puedes ejecutar manualmente:

`backend/database/migration_v6_wear_mobile.sql`

No elimina ni modifica datos existentes.

## Despliegue

Copia/mezcla los archivos de esta versión en tu repo actual y haz:

```bash
git add .
git commit -m "Integrate Luma Wear and mobile V6"
git push origin main
```

Render hará Auto Deploy.

Después valida:

- `/api/health`
- `/api/luma/health`

## Seguridad

No subas `.env`, `DATABASE_URL` ni `GOOGLE_WEATHER_API_KEY` a GitHub. Mantén los secretos únicamente en Render.
