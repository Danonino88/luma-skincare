# Luma Skincare V7.1 — Horarios personalizados por paso

## Cambio principal

V7.1 sustituye el temporizador visible de 5 minutos por horarios configurables para cada uno de los 7 pasos diarios.

Política de cada paso:

1. Alarma inicial a la hora configurada por el usuario.
2. Si el paso sigue pendiente, segundo aviso 10 minutos después.
3. Si continúa pendiente a los 20 minutos, el paso queda como **No realizado** para ese día.
4. Un paso no realizado impide alcanzar el 100 % diario y, por tanto, no aumenta la racha.

## Horarios predeterminados

- Limpieza de mañana: 08:00
- Hidratación de mañana: 08:30
- Protector solar: 09:00
- Cuidado de la tarde: 14:00
- Limpieza nocturna: 21:00
- Tratamiento nocturno: 21:30
- Hidratación nocturna: 22:00

Todos pueden modificarse desde la aplicación móvil mediante un selector de hora.

## Sincronización

Los horarios se guardan en PostgreSQL dentro de `luma_care_preferences.step_schedules` y se sincronizan al smartwatch mediante Wear Data Layer.

El smartwatch programa las alarmas usando la zona horaria sincronizada desde el teléfono.

## Backend

Nueva columna:

```sql
step_schedules JSONB NOT NULL DEFAULT '{}'::jsonb
```

Migración opcional incluida:

`backend/database/migration_v7_1_step_alarms.sql`

El backend también aplica `ADD COLUMN IF NOT EXISTS`, por lo que al desplegar la versión nueva puede crear la columna automáticamente.

Endpoint de salud esperado:

```json
{
  "ok": true,
  "service": "Luma Wear/Mobile API V7.1 Personalized Step Alarms",
  "database": "connected",
  "stepAlarmPolicy": {
    "retryMinutes": 10,
    "missedAfterMinutes": 20
  }
}
```

## Versiones Android

- Mobile: `3.1-v7.1-step-alarms`
- Wear: `5.1-v7.1-step-alarms`

## Compilación local

```powershell
$env:JAVA_HOME="C:\Users\danie\.jdks\jbr-21.0.11"
$env:ANDROID_HOME="C:\Users\danie\AppData\Local\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

.\gradlew.bat :mobile:assembleDebug
.\gradlew.bat :wear:assembleDebug
```

## Prueba recomendada

Para no esperar horas durante QA, configura temporalmente un paso a 2 o 3 minutos después de la hora actual:

- T0: debe sonar la alarma inicial.
- T+10 min: si no se marcó, debe aparecer el segundo aviso.
- T+20 min: si sigue sin marcar, debe aparecer `No realizado` y el paso debe quedar bloqueado para ese día.

Después vuelve a establecer el horario definitivo.
