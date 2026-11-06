# Práctica 8 — Pyramid Testing

Funcionalidad crítica: autenticación y control de acceso.

## 1. Pruebas unitarias
Desde `backend`:

```powershell
npm run test:unit
```

**Captura:** cuando aparezca `tests 3`, `pass 3`, `fail 0`.

Descripción sugerida: **Ejecución de tres pruebas unitarias sobre la validación de contraseñas, incluyendo un caso válido, un caso límite y un caso inválido.**

## 2. Pruebas de integración

```powershell
npm run test:integration
```

**Captura:** cuando aparezca `tests 2`, `pass 2`, `fail 0`.

Descripción sugerida: **Ejecución de dos pruebas de integración entre las rutas de autenticación, el manejo de sesiones y el almacenamiento local de prueba; se verificó un flujo correcto y el rechazo de una entrada inválida.**

## 3. Prueba E2E

```powershell
npm run test:e2e
```

**Captura:** cuando aparezca `tests 1`, `pass 1`, `fail 0`.

Descripción sugerida: **Prueba E2E automatizada del flujo completo de autenticación: registro, cierre de sesión, nuevo inicio de sesión, acceso al área privada y verificación de restricciones de permisos.**

## 4. Ejecutar todas las pruebas

```powershell
npm test
```

**Captura:** opcional como evidencia consolidada. Debe mostrar `tests 6`, `pass 6`, `fail 0`.

Descripción sugerida: **Ejecución consolidada de la pirámide de pruebas implementada para Luma Skincare.**
