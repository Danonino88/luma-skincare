import crypto from 'node:crypto'
import { cleanText, internalError, isFiniteInRange, isIsoDate, isSafeDeviceId, isUuid, logServerError } from './security-utils.js'

const DEFAULT_STEPS = [
  'morning_cleanse',
  'morning_hydrate',
  'morning_spf',
  'afternoon_spf',
  'night_cleanse',
  'night_treat',
  'night_hydrate',
]

function toIsoFromMillis(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return new Date().toISOString()
  return new Date(numeric).toISOString()
}

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function safeInt(value, fallback = 0) {
  return Math.round(safeNumber(value, fallback))
}

function googleConditionToWmo(type = '') {
  const value = String(type || '').toUpperCase()
  if (value.includes('CLEAR')) return 0
  if (value.includes('PARTLY') || value.includes('MOSTLY_CLEAR')) return 2
  if (value.includes('CLOUD') || value.includes('OVERCAST')) return 3
  if (value.includes('FOG') || value.includes('MIST')) return 45
  if (value.includes('DRIZZLE')) return 53
  if (value.includes('RAIN') || value.includes('SHOWER')) return 63
  if (value.includes('SNOW')) return 73
  if (value.includes('THUNDER')) return 95
  return -1
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'LumaSkincareBackend/6.0',
    },
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`HTTP ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ''}`)
  }
  return response.json()
}

async function fetchGoogleWeather(latitude, longitude) {
  const key = String(process.env.GOOGLE_WEATHER_API_KEY || '').trim()
  if (!key) throw new Error('GOOGLE_WEATHER_API_KEY no configurada')

  const common = new URLSearchParams({
    key,
    'location.latitude': String(latitude),
    'location.longitude': String(longitude),
    unitsSystem: 'METRIC',
    languageCode: 'es-419',
  })

  const [current, daily] = await Promise.all([
    fetchJson(`https://weather.googleapis.com/v1/currentConditions:lookup?${common}`),
    fetchJson(`https://weather.googleapis.com/v1/forecast/days:lookup?${common}&days=2&pageSize=2`),
  ])

  const tomorrow = Array.isArray(daily.forecastDays) && daily.forecastDays.length > 1
    ? daily.forecastDays[1]
    : null
  const tomorrowPart = tomorrow?.daytimeForecast || tomorrow?.fullDayForecast || {}

  return {
    ok: true,
    provider: 'google_weather',
    temperatureC: safeNumber(current?.temperature?.degrees),
    apparentTemperatureC: safeNumber(current?.feelsLikeTemperature?.degrees, safeNumber(current?.temperature?.degrees)),
    humidityPercent: safeInt(current?.relativeHumidity),
    uvIndex: safeNumber(current?.uvIndex),
    weatherCode: googleConditionToWmo(current?.weatherCondition?.type),
    conditionText: current?.weatherCondition?.description?.text || '',
    observedAt: current?.currentTime || new Date().toISOString(),
    cloudCoverPercent: safeInt(current?.cloudCover),
    precipitationMm: safeNumber(current?.precipitation?.qpf?.quantity),
    windSpeedKmh: safeNumber(current?.wind?.speed?.value),
    isDay: Boolean(current?.isDaytime),
    sourceLabel: 'Google Weather · ubicación real',
    locationLabel: `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
    tomorrow: {
      uvIndex: safeNumber(tomorrowPart?.uvIndex),
      maxTemperatureC: safeNumber(tomorrow?.maxTemperature?.degrees),
      minTemperatureC: safeNumber(tomorrow?.minTemperature?.degrees),
      conditionText: tomorrowPart?.weatherCondition?.description?.text || '',
      weatherCode: googleConditionToWmo(tomorrowPart?.weatherCondition?.type),
    },
  }
}

async function fetchOpenMeteo(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
    timezone: 'auto',
    forecast_days: '2',
    models: 'best_match',
  })
  const root = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`)
  const current = root.current || {}
  const daily = root.daily || {}

  return {
    ok: true,
    provider: 'open_meteo',
    temperatureC: safeNumber(current.temperature_2m),
    apparentTemperatureC: safeNumber(current.apparent_temperature, safeNumber(current.temperature_2m)),
    humidityPercent: safeInt(current.relative_humidity_2m),
    uvIndex: safeNumber(current.uv_index),
    weatherCode: safeInt(current.weather_code, -1),
    conditionText: '',
    observedAt: current.time || new Date().toISOString(),
    cloudCoverPercent: safeInt(current.cloud_cover),
    precipitationMm: safeNumber(current.precipitation),
    windSpeedKmh: safeNumber(current.wind_speed_10m),
    isDay: safeInt(current.is_day, 1) === 1,
    sourceLabel: 'Open-Meteo · respaldo',
    locationLabel: `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`,
    tomorrow: {
      uvIndex: safeNumber(daily.uv_index_max?.[1]),
      maxTemperatureC: safeNumber(daily.temperature_2m_max?.[1]),
      minTemperatureC: safeNumber(daily.temperature_2m_min?.[1]),
      conditionText: '',
      weatherCode: safeInt(daily.weather_code?.[1], -1),
    },
  }
}

export async function ensureLumaSchema(pool) {
  if (!pool) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS luma_devices (
      id BIGSERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      device_uuid VARCHAR(120) NOT NULL,
      device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('WEAR','MOBILE')),
      device_name VARCHAR(160),
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (usuario_id, device_uuid)
    );

    CREATE TABLE IF NOT EXISTS luma_routine_events (
      id BIGSERIAL PRIMARY KEY,
      event_uuid UUID NOT NULL UNIQUE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      device_id BIGINT REFERENCES luma_devices(id) ON DELETE SET NULL,
      routine_date DATE NOT NULL DEFAULT CURRENT_DATE,
      step_code VARCHAR(80) NOT NULL,
      routine_period VARCHAR(20) NOT NULL,
      completed BOOLEAN NOT NULL,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_luma_routine_user_date
      ON luma_routine_events(usuario_id, routine_date, occurred_at DESC);

    CREATE TABLE IF NOT EXISTS luma_weather_snapshots (
      id BIGSERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      device_id BIGINT REFERENCES luma_devices(id) ON DELETE SET NULL,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      temperature_c NUMERIC(6,2),
      humidity_percent INTEGER,
      uv_index NUMERIC(6,2),
      provider VARCHAR(80),
      observed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS luma_reminders (
      id BIGSERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      device_id BIGINT REFERENCES luma_devices(id) ON DELETE SET NULL,
      reminder_type VARCHAR(80) NOT NULL,
      scheduled_at TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ,
      status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS luma_care_preferences (
      usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
      morning_start SMALLINT NOT NULL DEFAULT 6,
      afternoon_start SMALLINT NOT NULL DEFAULT 11,
      night_start SMALLINT NOT NULL DEFAULT 19,
      sunscreen_temp_min NUMERIC(5,2) NOT NULL DEFAULT 20,
      sunscreen_uv_min NUMERIC(5,2) NOT NULL DEFAULT 3,
      hydration_temp_max NUMERIC(5,2) NOT NULL DEFAULT 20,
      hydration_humidity_max SMALLINT NOT NULL DEFAULT 45,
      reminder_minutes INTEGER NOT NULL DEFAULT 5,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

async function upsertDevice(pool, userId, deviceUuid, type = 'MOBILE', name = null) {
  if (!deviceUuid) return null
  const result = await pool.query(
    `INSERT INTO luma_devices (usuario_id, device_uuid, device_type, device_name, last_seen)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (usuario_id, device_uuid)
     DO UPDATE SET device_type = EXCLUDED.device_type,
                   device_name = COALESCE(EXCLUDED.device_name, luma_devices.device_name),
                   last_seen = NOW()
     RETURNING id, device_uuid, device_type, device_name, last_seen`,
    [userId, String(deviceUuid), String(type).toUpperCase() === 'WEAR' ? 'WEAR' : 'MOBILE', name || null],
  )
  return result.rows[0]
}

function normalizeDays(value) {
  const days = Number.parseInt(value, 10)
  if (!Number.isFinite(days)) return 7
  return Math.max(1, Math.min(days, 31))
}

export function registerLumaRoutes({ app, pool, authRequired }) {
  app.get('/api/luma/health', async (_req, res) => {
    let database = 'not_configured'
    if (pool) {
      try {
        await pool.query('SELECT 1')
        database = 'connected'
      } catch {
        database = 'connection_error'
      }
    }
    return res.json({
      ok: true,
      service: 'Luma Wear/Mobile API V6.3 Security',
      database,
      googleWeatherConfigured: Boolean(String(process.env.GOOGLE_WEATHER_API_KEY || '').trim()),
      weatherFallback: 'open_meteo',
      reminderMinutesDefault: 5,
    })
  })

  app.get('/api/luma/weather', authRequired, async (req, res) => {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ ok: false, message: 'Coordenadas inválidas.' })
    }

    try {
      try {
        const data = await fetchGoogleWeather(lat, lng)
        return res.json(data)
      } catch (googleError) {
        const fallback = await fetchOpenMeteo(lat, lng)
        logServerError('google-weather-fallback', googleError)
        return res.json({ ...fallback, providerFallback: true })
      }
    } catch (error) {
      logServerError('weather-upstream', error)
      return res.status(502).json({ ok: false, message: 'No fue posible consultar el clima.' })
    }
  })

  app.post('/api/luma/devices/ping', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const deviceId = cleanText(req.body?.deviceId, 120)
    const platform = cleanText(req.body?.platform, 20).toUpperCase()
    const deviceName = cleanText(req.body?.deviceName, 160)
    if (!isSafeDeviceId(deviceId) || !['WEAR', 'MOBILE'].includes(platform)) {
      return res.status(400).json({ ok: false, message: 'Datos de dispositivo inválidos.' })
    }
    try {
      const device = await upsertDevice(
        pool,
        req.auth.user.id,
        deviceId,
        platform,
        deviceName,
      )
      return res.json({ ok: true, device })
    } catch (error) {
      return internalError(res, 'No se pudo registrar el dispositivo.', error)
    }
  })

  app.post('/api/luma/routine-events', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const eventId = cleanText(req.body?.eventId || crypto.randomUUID(), 64)
    const stepId = cleanText(req.body?.stepId, 80)
    const period = cleanText(req.body?.period, 20).toUpperCase()
    const deviceId = cleanText(req.body?.deviceId, 120)
    const platform = cleanText(req.body?.platform || 'MOBILE', 20).toUpperCase()
    const allowedSteps = new Set([...DEFAULT_STEPS, 'afternoon_hydrate'])
    const allowedPeriods = new Set(['MAÑANA', 'TARDE', 'NOCHE'])
    const occurredAtMillis = Number(req.body?.occurredAt)
    const requestedRoutineDate = cleanText(req.body?.routineDate, 10)
    if (
      !isUuid(eventId) || !allowedSteps.has(stepId) || !allowedPeriods.has(period) ||
      !isSafeDeviceId(deviceId) || !['WEAR', 'MOBILE'].includes(platform) ||
      typeof req.body?.completed !== 'boolean' || !Number.isFinite(occurredAtMillis) || occurredAtMillis <= 0 ||
      (requestedRoutineDate && !isIsoDate(requestedRoutineDate))
    ) {
      return res.status(400).json({ ok: false, message: 'Evento de rutina inválido.' })
    }

    try {
      const device = await upsertDevice(pool, req.auth.user.id, deviceId, platform, cleanText(req.body?.deviceName, 160))
      const occurredAt = toIsoFromMillis(occurredAtMillis)
      const routineDate = requestedRoutineDate || new Date(occurredAt).toISOString().slice(0, 10)
      await pool.query(
        `INSERT INTO luma_routine_events
          (event_uuid, usuario_id, device_id, routine_date, step_code, routine_period, completed, occurred_at)
         VALUES ($1::uuid, $2, $3, $4::date, $5, $6, $7, $8::timestamptz)
         ON CONFLICT (event_uuid) DO NOTHING`,
        [eventId, req.auth.user.id, device?.id || null, routineDate, stepId, period, req.body.completed, occurredAt],
      )
      return res.json({ ok: true, eventId })
    } catch (error) {
      return internalError(res, 'No se pudo guardar la rutina.', error)
    }
  })

  app.get('/api/luma/routine-state', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const requestedDate = cleanText(req.query.date, 10)
    if (requestedDate && !isIsoDate(requestedDate)) {
      return res.status(400).json({ ok: false, message: 'Fecha inválida.' })
    }
    const date = requestedDate || new Date().toISOString().slice(0, 10)
    try {
      const rows = await pool.query(
        `SELECT DISTINCT ON (step_code)
                step_code, routine_period, completed, occurred_at
         FROM luma_routine_events
         WHERE usuario_id = $1 AND routine_date = $2::date
         ORDER BY step_code, occurred_at DESC, id DESC`,
        [req.auth.user.id, date],
      )
      const routine = Object.fromEntries(rows.rows.map((row) => [row.step_code, Boolean(row.completed)]))
      return res.json({ ok: true, date, routine, events: rows.rows })
    } catch (error) {
      return internalError(res, 'No se pudo obtener la rutina.', error)
    }
  })

  app.get('/api/luma/adherence', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    if (req.query.days != null && (!/^\d+$/.test(String(req.query.days)) || Number(req.query.days) < 1 || Number(req.query.days) > 31)) {
      return res.status(400).json({ ok: false, message: 'Rango de días inválido.' })
    }
    const days = normalizeDays(req.query.days)
    try {
      const result = await pool.query(
        `WITH dates AS (
           SELECT generate_series(CURRENT_DATE - ($2::int - 1), CURRENT_DATE, INTERVAL '1 day')::date AS day
         ), latest AS (
           SELECT DISTINCT ON (routine_date, step_code)
                  routine_date, step_code, completed
           FROM luma_routine_events
           WHERE usuario_id = $1
             AND routine_date >= CURRENT_DATE - ($2::int - 1)
           ORDER BY routine_date, step_code, occurred_at DESC, id DESC
         )
         SELECT d.day,
                COUNT(*) FILTER (WHERE l.completed = true)::int AS completed
         FROM dates d
         LEFT JOIN latest l ON l.routine_date = d.day
         GROUP BY d.day
         ORDER BY d.day ASC`,
        [req.auth.user.id, days],
      )
      const formatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short', timeZone: 'UTC' })
      const list = result.rows.map((row) => {
        const dateText = row.day instanceof Date
          ? row.day.toISOString().slice(0, 10)
          : String(row.day).slice(0, 10)
        const dateObject = new Date(`${dateText}T00:00:00Z`)
        return {
          date: dateText,
          label: formatter.format(dateObject).replace('.', '').slice(0, 3),
          completed: row.completed,
          total: DEFAULT_STEPS.length,
          percent: Math.min(100, Math.round((row.completed / DEFAULT_STEPS.length) * 100)),
        }
      })
      return res.json({ ok: true, days: list })
    } catch (error) {
      return internalError(res, 'No se pudo calcular la constancia.', error)
    }
  })

  app.post('/api/luma/weather-snapshots', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const deviceId = cleanText(req.body?.deviceId, 120)
    const platform = cleanText(req.body?.platform || 'WEAR', 20).toUpperCase()
    if (!isSafeDeviceId(deviceId) || !['WEAR', 'MOBILE'].includes(platform)) {
      return res.status(400).json({ ok: false, message: 'Datos de dispositivo inválidos.' })
    }
    if (req.body?.latitude != null && !isFiniteInRange(req.body.latitude, -90, 90)) return res.status(400).json({ ok: false, message: 'Latitud inválida.' })
    if (req.body?.longitude != null && !isFiniteInRange(req.body.longitude, -180, 180)) return res.status(400).json({ ok: false, message: 'Longitud inválida.' })
    if (req.body?.humidityPercent != null && !isFiniteInRange(req.body.humidityPercent, 0, 100)) return res.status(400).json({ ok: false, message: 'Humedad inválida.' })
    if (req.body?.uvIndex != null && !isFiniteInRange(req.body.uvIndex, 0, 30)) return res.status(400).json({ ok: false, message: 'UV inválido.' })
    if (req.body?.temperatureC != null && !isFiniteInRange(req.body.temperatureC, -100, 100)) return res.status(400).json({ ok: false, message: 'Temperatura inválida.' })
    try {
      const device = await upsertDevice(pool, req.auth.user.id, deviceId, platform, cleanText(req.body?.deviceName, 160))
      await pool.query(
        `INSERT INTO luma_weather_snapshots
          (usuario_id, device_id, latitude, longitude, temperature_c, humidity_percent, uv_index, provider, observed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz)`,
        [
          req.auth.user.id,
          device?.id || null,
          req.body.latitude ?? null,
          req.body.longitude ?? null,
          req.body.temperatureC ?? null,
          req.body.humidityPercent ?? null,
          req.body.uvIndex ?? null,
          String(req.body.source || '').slice(0, 80) || null,
          req.body.observedAt ? new Date(req.body.observedAt).toISOString() : new Date().toISOString(),
        ],
      )
      return res.json({ ok: true })
    } catch (error) {
      return internalError(res, 'No se pudo guardar el clima.', error)
    }
  })

  app.post('/api/luma/reminders', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const deviceId = cleanText(req.body?.deviceId, 120)
    const platform = cleanText(req.body?.platform || 'WEAR', 20).toUpperCase()
    const type = cleanText(req.body?.type || 'Cuidado de piel', 80)
    const dueAt = Number(req.body?.dueAt)
    if (!isSafeDeviceId(deviceId) || !['WEAR', 'MOBILE'].includes(platform) || !type || !Number.isFinite(dueAt) || dueAt <= 0) {
      return res.status(400).json({ ok: false, message: 'Recordatorio inválido.' })
    }
    try {
      const device = await upsertDevice(pool, req.auth.user.id, deviceId, platform, cleanText(req.body?.deviceName, 160))
      await pool.query(
        `INSERT INTO luma_reminders (usuario_id, device_id, reminder_type, scheduled_at, status)
         VALUES ($1,$2,$3,$4::timestamptz,'SCHEDULED')`,
        [req.auth.user.id, device?.id || null, type, toIsoFromMillis(dueAt)],
      )
      return res.json({ ok: true })
    } catch (error) {
      return internalError(res, 'No se pudo guardar el recordatorio.', error)
    }
  })

  app.get('/api/luma/preferences', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    try {
      await pool.query(
        `INSERT INTO luma_care_preferences (usuario_id) VALUES ($1)
         ON CONFLICT (usuario_id) DO NOTHING`,
        [req.auth.user.id],
      )
      const result = await pool.query('SELECT * FROM luma_care_preferences WHERE usuario_id = $1', [req.auth.user.id])
      return res.json({ ok: true, preferences: result.rows[0] })
    } catch (error) {
      return internalError(res, 'No se pudieron obtener las preferencias.', error)
    }
  })

  app.patch('/api/luma/preferences', authRequired, async (req, res) => {
    if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' })
    const numericFields = [
      ['morningStart', 0, 23], ['afternoonStart', 0, 23], ['nightStart', 0, 23],
      ['sunscreenTempMin', -50, 60], ['sunscreenUvMin', 0, 30], ['hydrationTempMax', -50, 60],
      ['hydrationHumidityMax', 0, 100], ['reminderMinutes', 1, 1440],
    ]
    for (const [field, min, max] of numericFields) {
      if (req.body?.[field] != null && !isFiniteInRange(req.body[field], min, max)) {
        return res.status(400).json({ ok: false, message: 'Preferencias inválidas.' })
      }
    }
    const values = {
      morning: Math.max(0, Math.min(23, safeInt(req.body.morningStart, 6))),
      afternoon: Math.max(0, Math.min(23, safeInt(req.body.afternoonStart, 11))),
      night: Math.max(0, Math.min(23, safeInt(req.body.nightStart, 19))),
      sunscreenTemp: safeNumber(req.body.sunscreenTempMin, 20),
      sunscreenUv: safeNumber(req.body.sunscreenUvMin, 3),
      hydrationTemp: safeNumber(req.body.hydrationTempMax, 20),
      hydrationHumidity: Math.max(0, Math.min(100, safeInt(req.body.hydrationHumidityMax, 45))),
      reminder: Math.max(1, Math.min(1440, safeInt(req.body.reminderMinutes, 5))),
    }
    try {
      const result = await pool.query(
        `INSERT INTO luma_care_preferences
          (usuario_id, morning_start, afternoon_start, night_start, sunscreen_temp_min, sunscreen_uv_min,
           hydration_temp_max, hydration_humidity_max, reminder_minutes, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
         ON CONFLICT (usuario_id) DO UPDATE SET
           morning_start=EXCLUDED.morning_start,
           afternoon_start=EXCLUDED.afternoon_start,
           night_start=EXCLUDED.night_start,
           sunscreen_temp_min=EXCLUDED.sunscreen_temp_min,
           sunscreen_uv_min=EXCLUDED.sunscreen_uv_min,
           hydration_temp_max=EXCLUDED.hydration_temp_max,
           hydration_humidity_max=EXCLUDED.hydration_humidity_max,
           reminder_minutes=EXCLUDED.reminder_minutes,
           updated_at=NOW()
         RETURNING *`,
        [req.auth.user.id, values.morning, values.afternoon, values.night, values.sunscreenTemp, values.sunscreenUv, values.hydrationTemp, values.hydrationHumidity, values.reminder],
      )
      return res.json({ ok: true, preferences: result.rows[0] })
    } catch (error) {
      return internalError(res, 'No se pudieron guardar las preferencias.', error)
    }
  })
}
