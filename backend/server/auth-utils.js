export const hasValidEmail = (email = '') =>
  /\S+@\S+\.\S+/.test(email)

export const hasStrongPassword = (password = '') =>
  password.length >= 8 &&
  /[A-ZÁÉÍÓÚÑ]/.test(password) &&
  /[a-záéíóúñ]/.test(password) &&
  /\d/.test(password)

export const normalizeEmail = (email = '') =>
  email.trim().toLowerCase()