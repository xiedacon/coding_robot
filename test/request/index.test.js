'use strict'

const test = require('ava').default
const rewire = require('rewire')

const request = rewire('../../lib/request')
const { coding } = require('../../config')

const asset = {
  url: 'test'
}

test.beforeEach(() => {
  request.__set__('superagent', {
    agent: function () {
      return this
    },
    get: function () {
      return this
    },
    set: () => Promise.resolve({ body: { code: 0 } })
  })
})

test.serial('it should work', async (t) => {
  await t.notThrows(request(asset.url))
})

test.serial('it should work with url and config', async (t) => {
  let agent = request.__get__('superagent')
  agent.get = function (url) {
    t.is(url, asset.url)
    return this
  }
  agent.set = function (headers) {
    t.is(headers.Cookie, coding.cookie)
    t.is(headers.Host, coding.domain)
    return Promise.resolve({ body: { code: 0 } })
  }

  await request(asset.url)
  t.plan(3)
})

test.serial('it should throw when net error', async (t) => {
  let agent = request.__get__('superagent')
  let err = new Error('test: net error')
  agent.set = () => Promise.resolve({ err, body: {} })

  let _err = await t.throws(request(asset.url))
  t.deepEqual(err, _err)
})

test.serial('it should throw when body.code !== 0', async (t) => {
  let agent = request.__get__('superagent')
  let body = { code: 1 }
  agent.set = () => Promise.resolve({ body })

  let err = await t.throws(request(asset.url))
  t.deepEqual(err, new Error(JSON.stringify(body)))
})
