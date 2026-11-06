import test from 'node:test'
import assert from 'node:assert/strict'
import { withTestServer, jsonRequest } from '../helpers/test-server.js'

test('Integración válida: registro + sesión protegida /api/auth/me', async () => {
  await withTestServer(async (baseUrl) => {
    const email = `integracion.${Date.now()}@luma.test`

    const register = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Prueba',
        lastName: 'Integración',
        phone: '4421234567',
        email,
        password: 'LumaTest123',
      }),
    })

    assert.equal(register.response.status, 201)
    assert.equal(register.data.ok, true)
    assert.equal(register.data.user.email, email)
    assert.ok(register.data.token)

    const me = await jsonRequest(baseUrl, '/api/auth/me', {
      headers: {
        Authorization: `Bearer ${register.data.token}`,
      },
    })

    assert.equal(me.response.status, 200)
    assert.equal(me.data.ok, true)
    assert.equal(me.data.user.email, email)
    assert.deepEqual(me.data.user.roles, ['Usuario'])
  })
})

test('Integración de error: el registro inválido es rechazado por la API', async () => {
  await withTestServer(async (baseUrl) => {
    const invalid = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Prueba',
        lastName: 'Inválida',
        email: 'correo-invalido',
        password: '123',
      }),
    })

    assert.equal(invalid.response.status, 400)
    assert.equal(invalid.data.ok, false)
    assert.match(invalid.data.message, /Datos inválidos/i)
  })
})
