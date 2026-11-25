BEGIN;

ALTER TABLE luma_care_preferences
  ADD COLUMN IF NOT EXISTS step_schedules JSONB NOT NULL DEFAULT '{}'::jsonb;

-- V7.1: cada uno de los 7 pasos puede guardar una hora HH:mm.
-- Política en Wear OS: aviso inicial, reaviso +10 min y NO REALIZADO a +20 min.

COMMIT;
