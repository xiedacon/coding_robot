'use strict'

const test = require('ava').default
const rewire = require('rewire')

const dingding = rewire('../../lib/dingding')

const asset = {
  title: 'title',
  lines: ['line', 'line', 'line']
}

test('it should work', (t) => {
  t.notThrows(() => {
    dingding.render(asset.title, asset.lines)
  })
})

test('it should transfer args to handler', (t) => {
  let args = [asset.title, asset.lines]
  dingding.__set__('handler', {
    render: (..._args) => {
      t.deepEqual(args, _args)
    }
  })

  dingding.render(asset.title, asset.lines)
})
