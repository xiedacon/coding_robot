'use strict'

const test = require('ava').default

const utils = require('../../lib/utils')

const asset = {
  test: 'test',
  obj: {
    1: {
      2: {
        3: {
          4: '4'
        }
      }
    }
  }
}

test('it should work', (t) => {
  t.is(utils.get(asset, 'test'), asset.test)
})

test('it should work with default value', (t) => {
  t.is(utils.get(asset.obj, 'a', 0), 0)
})

test('it should work with path', (t) => {
  t.is(utils.get(asset.obj, '1.2.3.4'), asset.obj[1][2][3][4])
})

test('it should work with array path', (t) => {
  t.is(utils.get(asset.obj, [1, 2, 3, 4]), asset.obj[1][2][3][4])
})

test('it should return default value with unlawful path', (t) => {
  t.is(utils.get(asset, { test: 'test' }, 0), 0)
})
