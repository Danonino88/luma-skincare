BEGIN;

ALTER TABLE luma_care_preferences
  ADD COLUMN IF NOT EXISTS skin_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS morning_reminder_hour SMALLINT NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS afternoon_reminder_hour SMALLINT NOT NULL DEFAULT 14,
  ADD COLUMN IF NOT EXISTS night_reminder_hour SMALLINT NOT NULL DEFAULT 21;

-- Valores permitidos a nivel de aplicación:
-- NORMAL, DRY, OILY, COMBINATION, SENSITIVE.
-- Se deja nullable para que usuarios existentes vean la selección en su siguiente inicio de sesión.

COMMIT;
