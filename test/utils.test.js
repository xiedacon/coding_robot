'use strict'

const { default: test } = require('ava')

const utils = require('../lib/utils')

test.beforeEach((t) => {
  t.context = {
    test: 'test',
    1: {
      2: {
        3: {
          4: '4'
        }
      }
    }
  }
})

test('utils.get: it should work', (t) => {
  t.is(utils.get(t.context, 'test'), t.context.test)
})

test('utils.get: it should work with default value', (t) => {
  t.is(utils.get(t.context, 'a', 0), 0)
})

test('utils.get: it should work with path', (t) => {
  t.is(utils.get(t.context, '1.2.3.4'), t.context[1][2][3][4])
})

test('utils.get: it should work with array path', (t) => {
  t.is(utils.get(t.context, [1, 2, 3, 4]), t.context[1][2][3][4])
})

test('utils.get: it should return default value with unlawful path', (t) => {
  t.is(utils.get(t.context, { test: 'test' }, 0), 0)
})

test('utils.set: it should work', (t) => {
  t.deepEqual(utils.set({}, 'test', 'test'), { test: 'test' })
})

test('utils.set: it should work with path', (t) => {
  t.deepEqual(utils.set({}, '1.2.3.4', 'test'), { 1: { 2: { 3: { 4: 'test' } } } })
})

test('utils.set: it should work with arry path', (t) => {
  t.deepEqual(utils.set({}, [1, 2, 3, 4], 'test'), { 1: { 2: { 3: { 4: 'test' } } } })
})

test('utils.set: it should return self with unlawful path', (t) => {
  t.deepEqual(utils.set({}, { test: 'test' }, 'test'), {})
})
