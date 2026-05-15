import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { formatData, prettifyKey } from '../utils'

describe('utils.prettifyKey', () => {
  test('uppercases the segment after the first dot', () => {
    assert.equal(prettifyKey('myinfo.email'), 'EMAIL')
  })

  test('replaces underscores with spaces', () => {
    assert.equal(prettifyKey('myinfo.full_name'), 'FULL NAME')
  })

  test('replaces all underscores, not just the first', () => {
    assert.equal(prettifyKey('a.first_middle_last'), 'FIRST MIDDLE LAST')
  })
})

describe('utils.formatData', () => {
  test('converts an object to an array of [prettyKey, value] pairs', () => {
    const result = formatData({
      'myinfo.full_name': 'John Doe',
      'myinfo.email': 'john@example.com',
    })
    assert.deepEqual(result, [
      ['FULL NAME', 'John Doe'],
      ['EMAIL', 'john@example.com'],
    ])
  })

  test('returns an empty array for an empty object', () => {
    assert.deepEqual(formatData({}), [])
  })

  test('preserves insertion order', () => {
    const result = formatData({
      'myinfo.b': '2',
      'myinfo.a': '1',
    })
    assert.deepEqual(result.map((r) => r[0]), ['B', 'A'])
  })
})
