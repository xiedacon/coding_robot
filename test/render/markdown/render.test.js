'use strict'

const test = require('ava').default
const rewire = require('rewire')

const config = require('../../../config')
const Markdown = rewire('../../../render/markdown')

const asset = {
  title: 'test',
  lines: ['line1', 'line2', 'line3'],
  ats: ['test1', 'test2']
}

test('it should work', (t) => {
  let mk = new Markdown(config)

  t.deepEqual(mk.render(asset.title, asset.lines), {
    'msgtype': 'markdown',
    'markdown': {
      title: asset.title,
      text: asset.lines.join(Markdown.__get__('enter'))
    },
    'at': {
      'atMobiles': [],
      'isAtAll': false
    }
  })
})

test('it should work when @someone', (t) => {
  let mk = new Markdown(Object.assign({}, config, {
    dingding: {
      users: [
        { realname: 'test1', name: '110' },
        { realname: 'test2', name: '120' }
      ]
    }
  }))

  t.deepEqual(mk.render(asset.title, [
    'line1 [@test1]()',
    'line2 @test2',
    'line2 @test1'
  ]), {
    'msgtype': 'markdown',
    'markdown': {
      title: asset.title,
      text: [
        'line1 @110',
        'line2 @120',
        'line2 @110'
      ].join(Markdown.__get__('enter'))
    },
    'at': {
      'atMobiles': ['110', '120'],
      'isAtAll': false
    }
  })
})

test('it should work when two @someone inline', (t) => {
  let mk = new Markdown(Object.assign({}, config, {
    dingding: {
      users: [
        { realname: 'test1', name: '110' },
        { realname: 'test2', name: '120' }
      ]
    }
  }))

  t.deepEqual(mk.render(asset.title, [
    'line1 [@test1]() @test1',
    'line2 @test2',
    'line2 @test1'
  ]), {
    'msgtype': 'markdown',
    'markdown': {
      title: asset.title,
      text: [
        'line1 @110 @110',
        'line2 @120',
        'line2 @110'
      ].join(Markdown.__get__('enter'))
    },
    'at': {
      'atMobiles': ['110', '120'],
      'isAtAll': false
    }
  })
})

test('it should work without title', (t) => {
  let mk = new Markdown(config)

  let now = Date.now
  Date.now = () => 1

  t.deepEqual(mk.render(undefined, asset.lines), {
    'msgtype': 'markdown',
    'markdown': {
      title: Date.now(),
      text: asset.lines.join(Markdown.__get__('enter'))
    },
    'at': {
      'atMobiles': [],
      'isAtAll': false
    }
  })

  Date.now = now
})

test('it should work without lines', (t) => {
  let mk = new Markdown(config)

  t.deepEqual(mk.render(asset.title), {
    'msgtype': 'markdown',
    'markdown': {
      title: asset.title,
      text: ''
    },
    'at': {
      'atMobiles': [],
      'isAtAll': false
    }
  })
})
