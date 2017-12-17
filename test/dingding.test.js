'use strict'

const _ = require('lodash')
const rewire = require('rewire')

const test = require('./tester')('dingding')
const dingding = rewire('../lib/dingding')

const enter = dingding.__get__('enter')

test('dingding.markdown: it should work', (t, { title, lines, message }) => {
  t.deepEqual(dingding.markdown(title, lines), message)
})

test('dingding.markdown: is should work with @somebody', (t, { title, lines, message, user, users }) => {
  lines.push(`@${user.realname}`)
  dingding.__set__('dingding', {
    users
  })

  _.set(message, 'markdown.text', lines.slice(0, -1).concat(`@${user.name}`).join(enter))
  _.set(message, 'at.atMobiles', [user.name])

  t.deepEqual(dingding.markdown(title, lines), message)
})

test('dingding.markdown: is should work with [@somebody]()', (t, { title, lines, message, user, users }) => {
  lines.push(`[@${user.realname}]()`)
  dingding.__set__('dingding', {
    users
  })

  _.set(message, 'markdown.text', lines.slice(0, -1).concat(`@${user.name}`).join(enter))
  _.set(message, 'at.atMobiles', [user.name])

  t.deepEqual(dingding.markdown(title, lines), message)
})

test('dingding.toMsgsMap: it should work', (t, { msg }) => {
  let msgs = [
    Object.assign({}, msg, {
      raw: {
        type: 'type1',
        action: 'action1'
      }
    }),
    Object.assign({}, msg, {
      raw: {
        type: 'type2',
        action: 'action2'
      }
    })
  ]

  dingding.__set__('robotMap', {
    type1: {
      action1: ['token1']
    },
    type2: {
      action2: ['token2']
    }
  })

  t.deepEqual(dingding.__get__('toMsgsMap')(msgs), {
    token1: [msgs[0].message],
    token2: [msgs[1].message]
  })
})

test('dingding.toMsgsMap: it should merge same robot\'s msg', (t, { msg }) => {
  let msgs = [
    Object.assign({}, msg, {
      raw: {
        type: 'type1',
        action: 'action1'
      }
    }),
    Object.assign({}, msg, {
      raw: {
        type: 'type1',
        action: 'action1'
      }
    })
  ]

  dingding.__set__('robotMap', {
    type1: {
      action1: ['token1']
    },
    type2: {
      action2: ['token2']
    }
  })

  t.deepEqual(dingding.__get__('toMsgsMap')(msgs), {
    token1: [msgs[0].message, msgs[1].message]
  })
})
