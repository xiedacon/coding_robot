'use strict'

const test = require('ava').default
const rewire = require('rewire')

const dingding = rewire('../../lib/dingding')

dingding.__set__('toMsgsMap', (m) => {
  return {
    test: m
  }
})
dingding.__set__('handler', {
  merge: (m) => m
})
dingding.__set__('agent', {
  post: function () {
    return this
  },
  set: function () {
    return this
  }
})

test('it should work', async (t) => {
  let msgs = ['test1', 'test2', 'test3']

  let _msgs = []
  let agent = dingding.__get__('agent')
  agent.send = (msg) => {
    _msgs.push(msg)

    return Promise.resolve()
  }

  await dingding.send(msgs)

  t.deepEqual(msgs, _msgs)
})

test('it should work with single message', async (t) => {
  let msg = 'test'

  let agent = dingding.__get__('agent')
  agent.send = (_msg) => {
    t.is(msg, _msg)
    return Promise.resolve()
  }

  t.plan(1)

  await dingding.send('test')
})
