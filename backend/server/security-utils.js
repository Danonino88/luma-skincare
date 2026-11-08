export const cleanText = (value, maxLength = 255) =>
  String(value ?? '').trim().slice(0, Math.max(0, maxLength))

export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))

export const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))

export const isSafeDeviceId = (value) => {
  const text = String(value || '').trim()
  return text.length >= 3 && text.length <= 120 && /^[A-Za-z0-9._:-]+$/.test(text)
}

export const isFiniteInRange = (value, min, max) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= min && number <= max
}

export function logServerError(context, error) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error')
  console.error(`[${context}] ${message}`)
}

export function internalError(res, message, error, context = 'internal') {
  logServerError(context, error)
  return res.status(500).json({ ok: false, message })
}
