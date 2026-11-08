import test from 'node:test'
import assert from 'node:assert/strict'
import { withTestServer, jsonRequest } from '../helpers/test-server.js'

test('Seguridad: rutas privadas de Luma rechazan solicitudes sin Bearer token', async () => {
  await withTestServer(async (baseUrl) => {
    for (const path of [
      '/api/luma/weather?lat=20.5888&lng=-100.3899',
      '/api/luma/routine-state',
      '/api/luma/adherence?days=7',
      '/api/luma/preferences',
    ]) {
      const result = await jsonRequest(baseUrl, path)
      assert.equal(result.response.status, 401, path)
      assert.equal(result.data.ok, false)
      assert.equal(Object.hasOwn(result.data, 'detail'), false)
    }
  })
})

test('Seguridad: login rechaza correo inválido y campos vacíos sin filtrar detalles internos', async () => {
  await withTestServer(async (baseUrl) => {
    const invalidEmail = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'correo-invalido', password: 'Luma1234' }),
    })
    assert.equal(invalidEmail.response.status, 400)
    assert.equal(invalidEmail.data.ok, false)
    assert.equal(Object.hasOwn(invalidEmail.data, 'detail'), false)

    const empty = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' }),
    })
    assert.equal(empty.response.status, 400)
    assert.equal(Object.hasOwn(empty.data, 'detail'), false)
  })
})

test('Seguridad: JSON mal formado devuelve 400 JSON controlado', async () => {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":',
    })
    const data = await response.json()
    assert.equal(response.status, 400)
    assert.equal(data.ok, false)
    assert.match(data.message, /JSON inválido/i)
    assert.equal(Object.hasOwn(data, 'detail'), false)
  })
})
