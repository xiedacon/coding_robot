'use strict'

const test = require('./tester')('utils')
const utils = require('../lib/utils')

test('utils.get: it should work', (t, context) => {
  t.is(utils.get(context, 'test'), context.test)
})

test('utils.get: it should work with default value', (t, { obj }) => {
  t.is(utils.get(obj, 'a', 0), 0)
})

test('utils.get: it should work with path', (t, { obj }) => {
  t.is(utils.get(obj, '1.2.3.4'), obj[1][2][3][4])
})

test('utils.get: it should work with array path', (t, { obj }) => {
  t.is(utils.get(obj, [1, 2, 3, 4]), obj[1][2][3][4])
})

test('utils.get: it should return default value with unlawful path', (t, context) => {
  t.is(utils.get(context, { test: 'test' }, 0), 0)
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
