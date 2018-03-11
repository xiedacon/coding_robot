/* eslint-disable no-unused-vars */
'use strict'

const test = require('ava').default
const rewire = require('rewire')

const config = require('../../../config')
const Markdown = rewire('../../../render/markdown')

test('it should work', (t) => {
  let mk = new Markdown(config)

  t.pass()
})

test('it should not work without config', (t) => {
  t.throws(() => {
    let mk = new Markdown()
  })
})

test('it should not work without config.core', (t) => {
  t.throws(() => {
    let mk = new Markdown({
      dingding: {}
    })
  })
})

test('it should not work without config.dingding', (t) => {
  t.throws(() => {
    let mk = new Markdown({
      core: {}
    })
  })
})

test('it should work without config.core.schedule', (t) => {
  let mk = new Markdown({
    core: {},
    dingding: {}
  })

  t.pass()
})

test('it should work without config.dingding.users', (t) => {
  let mk = new Markdown({
    core: {},
    dingding: {}
  })

  t.pass()
})
