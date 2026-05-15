import { test, describe, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../app'
import { sgidService } from '../../services/sgid-client.service'
import { nodeCache } from '../../services/node-cache.service'
import { BASE_URLS } from '../../config'

const stubAllAuthorizationUrls = () => {
  Object.keys(BASE_URLS).forEach((env) => {
    mock.method(sgidService[env], 'authorizationUrl', (envArg: string) => ({
      url: `https://api.example.com/v2/oauth/authorize?state=${envArg}`,
      nonce: `nonce-${envArg}`,
    }))
  })
}

describe('GET /', () => {
  const app = createApp()

  beforeEach(() => {
    stubAllAuthorizationUrls()
    mock.method(nodeCache, 'set', () => true)
  })

  afterEach(() => {
    mock.restoreAll()
  })

  test('renders the index view with a 200', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /text\/html/)
  })

  test('sets sessionId cookie with HttpOnly + SameSite=Lax in non-prod (no Secure flag)', async () => {
    const prevEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    try {
      const res = await request(app).get('/')
      const cookies = res.headers['set-cookie'] as unknown as string[]
      const sessionCookie = cookies.find((c) => c.startsWith('sessionId='))
      assert.ok(sessionCookie, 'sessionId cookie should be present')
      assert.match(sessionCookie!, /HttpOnly/)
      assert.match(sessionCookie!, /SameSite=Lax/)
      assert.doesNotMatch(
        sessionCookie!,
        /Secure/,
        'Secure must NOT be set over http://localhost dev',
      )
    } finally {
      process.env.NODE_ENV = prevEnv
    }
  })

  test('sets Secure + HttpOnly + SameSite=Lax when NODE_ENV=production (GCSOC ASM regression)', async () => {
    const prevEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const res = await request(app).get('/')
      const cookies = res.headers['set-cookie'] as unknown as string[]
      const sessionCookie = cookies.find((c) => c.startsWith('sessionId='))
      assert.ok(sessionCookie, 'sessionId cookie should be present')
      assert.match(sessionCookie!, /HttpOnly/)
      assert.match(sessionCookie!, /Secure/)
      assert.match(sessionCookie!, /SameSite=Lax/)
    } finally {
      process.env.NODE_ENV = prevEnv
    }
  })

  test('writes the freshly generated sessionId into the cache exactly once', async () => {
    const setSpy = mock.method(nodeCache, 'set', () => true)
    await request(app).get('/')
    assert.equal(setSpy.mock.calls.length, 1)
    const [sessionId, payload] = setSpy.mock.calls[0]!.arguments as [
      string,
      { codeVerifier: string; authNonce: Record<string, string> },
    ]
    assert.match(sessionId, /^[0-9a-f-]{36}$/)
    assert.ok(payload.codeVerifier)
    assert.ok(Object.keys(payload.authNonce).length > 0)
  })
})
