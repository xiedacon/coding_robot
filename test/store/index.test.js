'use strict'

const test = require('ava').default
const rewire = require('rewire')

const Store = rewire('../../lib/store')

test('it should work', async (t) => {
  let store = new Store()

  await store.set('test', 'test')

  t.is(await store.get('test'), 'test')
})
