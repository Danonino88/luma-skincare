export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export function getStoredSession() {
  try {
    const raw = localStorage.getItem('luma_auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredSession(session) {
  localStorage.setItem('luma_auth', JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem('luma_auth')
}

export async function apiRequest(path, options = {}) {
  const token = options.token || getStoredSession()?.token
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await response.json().catch(() => ({ ok: false, message: 'Respuesta no válida del servidor.' }))

  if (!response.ok) {
    const message = data.message || 'Ocurrió un error al procesar la solicitud.'
    throw new Error(message)
  }

  return data
}
