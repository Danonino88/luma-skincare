BEGIN;

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

COMMIT;
