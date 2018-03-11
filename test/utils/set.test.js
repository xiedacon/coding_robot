'use strict'

const test = require('ava').default
const utils = require('../../lib/utils')

test('it should work', (t) => {
  t.deepEqual(utils.set({}, 'test', 'test'), { test: 'test' })
})

test('it should work with path', (t) => {
  t.deepEqual(utils.set({}, '1.2.3.4', 'test'), { 1: { 2: { 3: { 4: 'test' } } } })
})

test('it should work with arry path', (t) => {
  t.deepEqual(utils.set({}, [1, 2, 3, 4], 'test'), { 1: { 2: { 3: { 4: 'test' } } } })
})

test('it should return self with unlawful path', (t) => {
  t.deepEqual(utils.set({}, { test: 'test' }, 'test'), {})
})

test('it should direct return when obj is undefined', (t) => {
  t.deepEqual(utils.set(undefined), undefined)
})

test('it should return self when path is empty arry', (t) => {
  t.deepEqual(utils.set({}, [], 'test'), {})
})
