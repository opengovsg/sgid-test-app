import { test, describe, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../app'
import { sgidService } from '../../services/sgid-client.service'
import { nodeCache } from '../../services/node-cache.service'

describe('GET /callback', () => {
  const app = createApp()

  afterEach(() => mock.restoreAll())

  test('renders userinfo on success (sub + formatted data)', async () => {
    mock.method(nodeCache, 'get', () => ({
      codeVerifier: 'cv',
      authNonce: { prod: 'nonce-prod' },
    }))
    const callbackSpy = mock.method(sgidService.prod, 'callback', async () => ({
      sub: 'user-123',
      accessToken: 'token-abc',
    }))
    const userinfoSpy = mock.method(sgidService.prod, 'userinfo', async () => ({
      data: {
        'myinfo.full_name': 'John Doe',
        'myinfo.email': 'john@example.com',
      },
    }))

    const res = await request(app)
      .get('/callback')
      .query({ code: 'code-xyz', state: 'prod' })

    assert.equal(res.status, 200)
    assert.match(res.text, /user-123/)
    assert.match(res.text, /John Doe/)
    assert.match(res.text, /FULL NAME/)
    assert.match(res.text, /EMAIL/)

    assert.equal(callbackSpy.mock.calls.length, 1)
    assert.deepEqual(callbackSpy.mock.calls[0]!.arguments, [
      'code-xyz',
      'nonce-prod',
      'cv',
    ])
    assert.equal(userinfoSpy.mock.calls.length, 1)
    assert.deepEqual(userinfoSpy.mock.calls[0]!.arguments, [
      'token-abc',
      'user-123',
    ])
  })

  test('renders error page (500) when sgid callback throws', async () => {
    mock.method(nodeCache, 'get', () => ({
      codeVerifier: 'cv',
      authNonce: { prod: 'nonce' },
    }))
    mock.method(sgidService.prod, 'callback', async () => {
      throw new Error('sgid down')
    })

    const res = await request(app)
      .get('/callback')
      .query({ code: 'code', state: 'prod' })

    assert.equal(res.status, 500)
  })

  test('renders error page (500) when userinfo throws', async () => {
    mock.method(nodeCache, 'get', () => ({
      codeVerifier: 'cv',
      authNonce: { stag: 'nonce' },
    }))
    mock.method(sgidService.stag, 'callback', async () => ({
      sub: 'sub',
      accessToken: 'tok',
    }))
    mock.method(sgidService.stag, 'userinfo', async () => {
      throw new Error('userinfo down')
    })

    const res = await request(app)
      .get('/callback')
      .query({ code: 'code', state: 'stag' })

    assert.equal(res.status, 500)
  })

  test('returns 400 when code/state query params are missing', async () => {
    const res = await request(app).get('/callback')
    assert.equal(res.status, 400)
  })

  test('returns 400 when state maps to no configured environment', async () => {
    const res = await request(app)
      .get('/callback')
      .query({ code: 'code', state: 'not-a-real-env' })
    assert.equal(res.status, 400)
  })

  test('returns 400 when the session is expired/missing', async () => {
    mock.method(nodeCache, 'get', () => undefined)
    const res = await request(app)
      .get('/callback')
      .query({ code: 'code', state: 'prod' })
    assert.equal(res.status, 400)
  })

  test('routes to the correct env-specific service based on the `state` query param', async () => {
    mock.method(nodeCache, 'get', () => ({
      codeVerifier: 'cv',
      authNonce: { stag: 'nonce-stag' },
    }))
    const prodSpy = mock.method(sgidService.prod, 'callback', async () => ({
      sub: 'unexpected',
      accessToken: 'unexpected',
    }))
    const stagSpy = mock.method(sgidService.stag, 'callback', async () => ({
      sub: 'sub-stag',
      accessToken: 'tok-stag',
    }))
    mock.method(sgidService.stag, 'userinfo', async () => ({
      data: { 'myinfo.x': 'y' },
    }))

    const res = await request(app)
      .get('/callback')
      .query({ code: 'c', state: 'stag' })

    assert.equal(res.status, 200)
    assert.equal(prodSpy.mock.calls.length, 0)
    assert.equal(stagSpy.mock.calls.length, 1)
  })
})
