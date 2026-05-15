import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../app'

describe('helmet security headers (CSP middleware)', () => {
  const app = createApp()

  test('responds with a Content-Security-Policy header containing our directives', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    const csp = res.headers['content-security-policy']
    assert.ok(csp, 'CSP header must be present')
    assert.match(csp, /default-src 'self'/)
    assert.match(csp, /base-uri 'self'/)
    assert.match(csp, /object-src 'none'/)
    assert.match(csp, /script-src-attr 'none'/)
    assert.match(csp, /frame-ancestors 'self'/)
  })

  test('responds with HSTS (helmet 8 default)', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    assert.ok(res.headers['strict-transport-security'])
  })

  test('responds with X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    assert.equal(res.headers['x-content-type-options'], 'nosniff')
  })

  test('responds with X-Frame-Options: SAMEORIGIN', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN')
  })

  test('does not leak X-Powered-By', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    assert.equal(res.headers['x-powered-by'], undefined)
  })
})
