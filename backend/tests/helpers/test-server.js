import { once } from 'node:events'

process.env.NODE_ENV = 'test'

const { app, resetMemory } = await import('../../server/index.js')

export async function withTestServer(callback) {
  resetMemory()

  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')

  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    return await callback(baseUrl)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
}

export async function jsonRequest(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const data = await response.json()
  return { response, data }
}
