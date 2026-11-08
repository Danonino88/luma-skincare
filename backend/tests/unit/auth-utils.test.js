import test from 'node:test'
import assert from 'node:assert/strict'
import { hasStrongPassword } from '../../server/auth-utils.js'

test('Caso válido: acepta una contraseña segura', () => {
  assert.equal(hasStrongPassword('LumaSeguro2026'), true)
})

test('Caso límite: acepta exactamente 8 caracteres si cumple las reglas', () => {
  assert.equal(hasStrongPassword('Luma1234'), true)
})

test('Caso inválido: rechaza contraseña sin mayúscula', () => {
  assert.equal(hasStrongPassword('lumaseguro2026'), false)
})

import { hasValidEmail, normalizeEmail } from '../../server/auth-utils.js'

test('Seguridad: normaliza y valida correos sin espacios', () => {
  assert.equal(normalizeEmail('  Usuario@Luma.COM  '), 'usuario@luma.com')
  assert.equal(hasValidEmail('usuario@luma.com'), true)
  assert.equal(hasValidEmail('usuario@@luma'), false)
  assert.equal(hasValidEmail(''), false)
})
