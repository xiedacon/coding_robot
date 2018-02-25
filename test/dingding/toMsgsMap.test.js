'use strict'

const test = require('ava').default
const rewire = require('rewire')

const dingding = rewire('../../lib/dingding')
const enter = rewire('../../render/markdown').__get__('enter')

const asset = {
  message: {
    'msgtype': 'markdown',
    'markdown': {
      title: 'test',
      text: ['test', 'test', 'test', 'test', 'test'].join(enter)
    },
    'at': {
      'atMobiles': [],
      'isAtAll': false
    }
  },
  raw: {
    type: 'type',
    action: 'action'
  }
}

test('it should work', (t) => {
  let msgs = [
    Object.assign({}, asset, {
      raw: {
        type: 'type1',
        action: 'action1'
      }
    }),
    Object.assign({}, asset, {
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

test('it should merge same robot\'s msg', (t) => {
  let msgs = [
    Object.assign({}, asset, {
      raw: {
        type: 'type1',
        action: 'action1'
      }
    }),
    Object.assign({}, asset, {
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
