import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { normalisePem } from '../utils/pem'

describe('utils.normalisePem', () => {
  const wellFormed =
    '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEowIBAAKCAQEAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n' +
    'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy\n' +
    '-----END RSA PRIVATE KEY-----\n'

  test('returns input unchanged when it already contains newlines', () => {
    assert.equal(normalisePem(wellFormed), wellFormed)
  })

  test('rehydrates a flattened single-line PEM into wrapped lines', () => {
    const flattened =
      '-----BEGIN RSA PRIVATE KEY----- MIIEowIBAAKCAQEAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy -----END RSA PRIVATE KEY-----'
    const result = normalisePem(flattened)
    assert.match(result, /^-----BEGIN RSA PRIVATE KEY-----\n/)
    assert.match(result, /\n-----END RSA PRIVATE KEY-----\n$/)
    // No line in the body should exceed 64 chars.
    const bodyLines = result.split('\n').slice(1, -2)
    assert.ok(bodyLines.every((l) => l.length <= 64))
  })

  test('works for PKCS#8 PRIVATE KEY label too', () => {
    const flattened =
      '-----BEGIN PRIVATE KEY----- AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMMNNNNOOOOPPPP -----END PRIVATE KEY-----'
    const result = normalisePem(flattened)
    assert.match(result, /^-----BEGIN PRIVATE KEY-----\n/)
    assert.match(result, /\n-----END PRIVATE KEY-----\n$/)
  })

  test('returns empty string for undefined input', () => {
    assert.equal(normalisePem(undefined), '')
  })

  test('returns input unchanged if no PEM markers present', () => {
    assert.equal(normalisePem('not a pem'), 'not a pem')
  })
})
