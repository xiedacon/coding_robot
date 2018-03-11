'use strict'

const test = require('ava').default
const rewire = require('rewire')

const Store = rewire('../../lib/store')

test('it should work', async (t) => {
  let store = new Store()

  await store.set('test', 'test')

  t.is(await store.get('test'), 'test')
})

test('it should clear store', async (t) => {
  let store = new Store({
    clear: 10
  })

  await store.set('test', 'test')

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 10)
  })

  t.is(await store.get('test'), undefined)
})
