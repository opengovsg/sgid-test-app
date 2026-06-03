import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../app'

describe('GET /healthz', () => {
  const app = createApp()

  test('returns 200 OK as a plain-text liveness probe', async () => {
    const res = await request(app).get('/healthz')
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /text\/plain/)
    assert.equal(res.text, 'OK')
  })
})

describe('GET /favicon.ico', () => {
  const app = createApp()

  test('serves the favicon asset (200) instead of 404', async () => {
    const res = await request(app).get('/favicon.ico')
    assert.equal(res.status, 200)
    assert.match(res.headers['content-type'], /image\/png/)
  })
})
