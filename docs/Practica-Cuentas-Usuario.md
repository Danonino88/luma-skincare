# Práctica — Administración de cuentas de usuario

## 1. Objetivo

Comprender la administración de cuentas de usuario dentro de un sistema protegido, aplicando operaciones de creación, modificación, habilitación, deshabilitación y verificación del estado de cuentas, así como el análisis de sus implicaciones de seguridad.

En el proyecto Luma Skincare se implementó esta práctica dentro del panel administrativo. El administrador puede crear cuentas, consultar su estado, revisar fecha de creación, verificar último inicio de sesión, identificar el grupo o rol asignado, solicitar cambio de contraseña, deshabilitar usuarios y volver a habilitarlos.

## 2. Conceptos principales

Una cuenta de usuario permite controlar el acceso a los recursos de un sistema. En una aplicación web protegida, la cuenta se relaciona con permisos, roles, sesiones y módulos disponibles.

Una cuenta puede encontrarse en dos estados principales:

- **Habilitada:** el usuario puede autenticarse normalmente.
- **Deshabilitada:** la cuenta permanece almacenada en el sistema, pero el usuario no puede iniciar sesión.

Deshabilitar una cuenta es una buena práctica cuando se necesita conservar la información del usuario sin permitir acceso al sistema. Esto ayuda a mantener trazabilidad, auditoría y evidencia histórica.

## 3. Implementación en Luma Skincare

La funcionalidad se implementó en el panel del administrador, dentro del módulo **Usuarios del sistema**.

Archivos principales:

- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/index.css`
- `backend/server/index.js`
- `backend/database/schema.sql`

Tablas relacionadas:

- `usuarios`
- `roles`
- `permisos`
- `usuario_rol`
- `rol_permiso`
- `sesiones`

## 4. Evidencia de creación de usuarios

Desde el dashboard administrativo se creó un módulo para generar los usuarios de práctica:

- `alumno1@luma.local` — rol Editor
- `alumno2@luma.local` — rol Editor
- `invitado@luma.local` — rol Usuario

Los tres usuarios utilizan la contraseña temporal:

`Alumno1234`

En el reporte se debe anexar captura de:

1. Panel administrativo abierto.
2. Botón **Crear usuarios de práctica**.
3. Tabla con los tres usuarios creados.
4. Estado de cada cuenta como habilitada.

## 5. Datos identificados por cada usuario

Para cada usuario el sistema muestra:

- Nombre completo.
- Estado de la cuenta.
- Fecha de creación.
- Último inicio de sesión.
- Grupo o rol al que pertenece.
- Si requiere cambio de contraseña.

## 6. Tabla de usuarios

| Usuario | Habilitado | Grupo | Cambio de contraseña |
|---|---|---|---|
| alumno1@luma.local | Sí | Editores | Sí |
| alumno2@luma.local | Sí | Editores | Sí |
| invitado@luma.local | Sí | Usuarios | Sí |

## 7. Deshabilitación de un usuario

Se deshabilitó uno de los usuarios con la misma jerarquía, por ejemplo:

`alumno2@luma.local`

Al deshabilitarlo, el sistema conserva la cuenta en la base de datos, pero cambia su estado a inactivo. Además, las sesiones activas del usuario son revocadas.

Evidencia requerida:

1. Captura del usuario antes de deshabilitar.
2. Captura dando clic en **Deshabilitar**.
3. Captura donde el usuario aparece como **No habilitado**.
4. Intento de inicio de sesión con ese usuario.
5. Mensaje donde se comprueba que no puede iniciar sesión.

## 8. Habilitación del usuario

Después de comprobar que el usuario deshabilitado no puede iniciar sesión, se vuelve a habilitar desde el panel administrativo.

La propiedad que cambia es:

`activo`

Cuando `activo = true`, el usuario puede iniciar sesión. Cuando `activo = false`, el usuario permanece registrado, pero no puede autenticarse.

Evidencia requerida:

1. Captura dando clic en **Habilitar**.
2. Captura donde el usuario aparece habilitado nuevamente.
3. Inicio de sesión exitoso con el usuario habilitado.

## 9. Pruebas de ejecución de comandos

La deshabilitación también puede demostrarse desde la petición protegida del backend:

```http
PATCH /api/admin/users/:id/status
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN

{
  "active": false
}
```

Para volver a habilitar:

```http
PATCH /api/admin/users/:id/status
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN

{
  "active": true
}
```

En PostgreSQL también se puede verificar la propiedad directamente:

```sql
SELECT id, nombre, email, activo, creado_en, ultimo_login, requiere_cambio_password, grupo_sistema
FROM usuarios
ORDER BY id;
```

## 10. Comparación: deshabilitar usuario vs eliminar usuario

| Acción | ¿Se conserva la información? | ¿Puede iniciar sesión? | ¿Puede recuperarse fácilmente? |
|---|---|---|---|
| Deshabilitar usuario | Sí. La cuenta, historial, roles y datos permanecen registrados. | No, mientras la cuenta esté deshabilitada. | Sí. Solo se vuelve a habilitar la cuenta. |
| Eliminar usuario | No completamente. Se pierde la cuenta y puede perderse información asociada. | No. La cuenta deja de existir. | No fácilmente. Requiere restaurar respaldo o crear otra cuenta. |

## 11. Casos prácticos

| Empleado | Situación | ¿Eliminar la cuenta? | ¿Deshabilitar la cuenta? | Justificación |
|---|---|---|---|---|
| Ana | Vacaciones por 6 meses | No | Sí | La ausencia es temporal. Conviene conservar la cuenta y evitar accesos durante el periodo. |
| Luis | Renunció definitivamente | Depende de la política de auditoría | Sí inicialmente | Primero se recomienda deshabilitar para conservar evidencias. Después, si la política lo permite, se puede eliminar o archivar. |
| Pedro | Suspendido durante una investigación | No | Sí | Es necesario bloquear acceso inmediatamente, pero conservar la información para investigación y auditoría. |
| María | Cambio temporal de departamento | No | Sí o modificar permisos | Si el cambio es temporal, se puede deshabilitar el acceso anterior o ajustar permisos sin eliminar la cuenta. |

## 12. Preguntas finales

### ¿Cuál es la diferencia entre deshabilitar y eliminar un usuario?

Deshabilitar un usuario significa conservar la cuenta en el sistema, pero impedir que pueda iniciar sesión. Eliminar un usuario significa borrar la cuenta, lo cual puede provocar pérdida de configuración, historial o datos relacionados.

### ¿Qué ventajas ofrece deshabilitar una cuenta?

Permite bloquear el acceso sin perder información. También conserva datos útiles para auditoría, facilita la recuperación de la cuenta y reduce riesgos cuando la ausencia del usuario es temporal.

### ¿Qué riesgos existen si nunca se deshabilitan cuentas antiguas?

Las cuentas antiguas pueden convertirse en puntos de acceso no controlados. Si una cuenta permanece activa sin ser usada, puede ser aprovechada por terceros, ex empleados o atacantes para acceder a recursos del sistema.

### ¿Qué sucede con los archivos personales de un usuario deshabilitado?

Los archivos y datos personales normalmente se conservan. La cuenta queda bloqueada para iniciar sesión, pero su información no se elimina. Esto permite recuperar datos o revisarlos en caso de auditoría.

### ¿En qué escenarios empresariales se recomienda esta práctica?

Se recomienda cuando un empleado sale temporalmente, cuando existe una investigación, cuando se detecta actividad sospechosa, cuando un usuario cambia temporalmente de área o cuando se requiere conservar información sin permitir acceso al sistema.

## 13. Conclusión

La administración correcta de cuentas de usuario es fundamental para la seguridad de cualquier sistema. En esta práctica se implementaron operaciones de creación, verificación, deshabilitación y habilitación de usuarios, manteniendo la información almacenada y protegiendo el acceso mediante roles, permisos y sesiones.

Deshabilitar una cuenta resulta más seguro que eliminarla cuando se requiere conservar evidencia, mantener historial y permitir una recuperación rápida en caso necesario.
