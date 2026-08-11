# Luma Skincare — Proyecto profesional con prácticas 1 a 10

Proyecto React + Vite separado en frontend y backend. La interfaz pública se mantiene como un sitio profesional de skincare, pero conserva las funcionalidades solicitadas en las prácticas.

## Estructura

```txt
luma-skincare-profesional-v11/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── images/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── server/
    │   └── index.js
    ├── database/
    │   ├── schema.sql
    │   └── auth-erd.drawio
    ├── data/
    │   └── siteData.js
    ├── package.json
    └── .env.example
```

## Ejecutar frontend

```powershell
cd "C:\projects\luma-skincare-profesional-v11\frontend"
npm install
npm run dev
```

## Ejecutar backend

```powershell
cd "C:\projects\luma-skincare-profesional-v11\backend"
npm install
npm run server
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Base de datos PostgreSQL

1. Crear base de datos:

```sql
CREATE DATABASE luma_skincare;
```

2. Ejecutar el script:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d luma_skincare -f "C:\projects\luma-skincare-profesional-v11\backend\database\schema.sql"
```

3. Copiar `backend/.env.example` como `backend/.env` y configurar:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/luma_skincare
SESSION_SECRET=luma_secret_2026
```

## Prácticas cubiertas

- Prácticas 1 y 2: framework, mockup, estructura, interfaz, herramientas, secciones, header, cuerpo, footer, hipervínculos e imágenes.
- Prácticas 3 y 4: DOM, Virtual DOM, comunicación asíncrona con formulario y backend.
- Prácticas 5 y 6: menú desplegable por eventos de puntero y banner calendarizado.
- Prácticas 7 y 8: actualización de temporada y destacado de contenido con puntero mediante addEventListener.
- Prácticas 9 y 10: registro, login, hash de contraseñas, sesiones, roles, permisos y dashboard protegido.

## Autenticación

El registro público siempre crea usuarios normales con rol Usuario. El administrador se crea una sola vez desde el backend con `npm run admin:create`.  
El dashboard muestra módulos según permisos:

- Administrador: usuarios, mensajes, contenido y seguridad.
- Editor: contenido, mensajes y perfil.
- Usuario: dashboard básico y permisos de perfil.

## Navegación

Las vistas secundarias como productos, blog, nosotros, login y páginas legales se abren en una nueva pestaña desde la landing. El login redirige al dashboard en la misma pestaña de acceso.
