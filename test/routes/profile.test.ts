import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../../app'

describe('GET /profile', () => {
  const app = createApp()

  test('renders the callback view with masked NRIC + derived DOB', async () => {
    const res = await request(app).get('/profile').query({ uin: 'S1234567A' })
    assert.equal(res.status, 200)
    assert.match(res.text, /S1234567A/)
    assert.match(res.text, /\*{5}567A/)
    // Route derives the DOB day from nric[2] (the 3rd character).
    // For 'S1234567A' that is '2', so the rendered date is '2 Jun 1993'.
    assert.match(res.text, /2 Jun 1993/)
  })

  test('does not 500 when uin is missing (defensive)', async () => {
    const res = await request(app).get('/profile')
    assert.equal(res.status, 200)
  })
})
