export const normalizeEmail = (email = '') =>
  String(email ?? '').trim().toLowerCase().slice(0, 180)

export const hasValidEmail = (email = '') => {
  const normalized = normalizeEmail(email)
  if (!normalized || normalized.length > 180) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)
}

export const hasStrongPassword = (password = '') => {
  const value = String(password ?? '')
  return value.length >= 8 &&
    value.length <= 128 &&
    /[A-ZÁÉÍÓÚÑ]/.test(value) &&
    /[a-záéíóúñ]/.test(value) &&
    /\d/.test(value)
}
