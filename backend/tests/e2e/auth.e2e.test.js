import test from 'node:test'
import assert from 'node:assert/strict'
import { withTestServer, jsonRequest } from '../helpers/test-server.js'

test('E2E: registro → logout → login → área privada → control de acceso', async () => {
  await withTestServer(async (baseUrl) => {
    const email = `e2e.${Date.now()}@luma.test`
    const password = 'LumaE2E123'

    // 1. El usuario se registra.
    const register = await jsonRequest(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Prueba',
        lastName: 'E2E',
        phone: '4425550101',
        email,
        password,
      }),
    })

    assert.equal(register.response.status, 201)
    assert.equal(register.data.user.email, email)
    const firstToken = register.data.token

    // 2. Cierra la sesión creada durante el registro.
    const logout = await jsonRequest(baseUrl, '/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${firstToken}` },
    })

    assert.equal(logout.response.status, 200)
    assert.equal(logout.data.ok, true)

    // 3. El token anterior ya no debe permitir entrar al área privada.
    const expiredSession = await jsonRequest(baseUrl, '/api/auth/me', {
      headers: { Authorization: `Bearer ${firstToken}` },
    })

    assert.equal(expiredSession.response.status, 401)

    // 4. Inicia sesión nuevamente con sus credenciales.
    const login = await jsonRequest(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    assert.equal(login.response.status, 200)
    assert.equal(login.data.ok, true)
    const token = login.data.token

    // 5. Accede correctamente a su información privada.
    const me = await jsonRequest(baseUrl, '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(me.response.status, 200)
    assert.equal(me.data.user.email, email)
    assert.deepEqual(me.data.user.roles, ['Usuario'])

    // 6. Un Usuario normal no debe acceder a la administración de cuentas.
    const adminUsers = await jsonRequest(baseUrl, '/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })

    assert.equal(adminUsers.response.status, 403)
    assert.equal(adminUsers.data.ok, false)
    assert.match(adminUsers.data.message, /No tienes permisos/i)
  })
})
