'use strict'

const test = require('ava').default
const rewire = require('rewire')

const config = require('../../../config')
const Markdown = rewire('../../../render/markdown')

Markdown.__set__('mergeMarkdown', (arr) => arr[0])

test('it should work', (t) => {
  let mk = new Markdown(config)
  mk.merge([])

  t.pass()
})

test('it should direct return when msgs.length <= limit', (t) => {
  let mk = new Markdown(Object.assign({}, config, {
    core: {
      schedule: '0 * * * * *',
      managers: ['管理员']
    }
  }))

  // 钉钉机器人频率限制为 20 次 / 分
  t.deepEqual(mk.merge(Array(19).fill(1)), Array(19).fill(1))
})

test('it should return array which length is limit when msgs.length > limit', (t) => {
  let mk = new Markdown(Object.assign({}, config, {
    core: {
      schedule: '0 * * * * *',
      managers: ['管理员']
    }
  }))

  // 钉钉机器人频率限制为 20 次 / 分
  t.deepEqual(mk.merge(Array(21).fill(1)), Array(20).fill(1))
})
