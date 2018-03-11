'use strict'

const test = require('ava').default
const rewire = require('rewire')

const Markdown = rewire('../../../render/markdown')

const asset = {
  'msgtype': 'markdown',
  'markdown': {
    title: 'test title',
    text: 'test text'
  },
  'at': {
    'atMobiles': ['test'],
    'isAtAll': false
  }
}

test('it should work', (t) => {
  Markdown.__get__('mergeMarkdown')([Object.assign({}, asset), Object.assign({}, asset)])

  t.pass()
})

test('it should merge contents', (t) => {
  let enter = Markdown.__get__('enter')
  let merged = Object.assign({}, asset, {
    markdown: {
      title: Array(3).fill(asset.markdown.title).join(' & '),
      text: Array(3).fill(asset.markdown.text).join(`${enter} —————————————— ${enter}`)
    },
    at: {
      atMobiles: ['test1', 'test2', 'test3'],
      isAtAll: false
    }
  })

  t.deepEqual(merged, Markdown.__get__('mergeMarkdown')([
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test1'],
        isAtAll: false
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test2'],
        isAtAll: false
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test3'],
        isAtAll: false
      }
    })
  ]))
})

test('it should @ all when some msg @ all', (t) => {
  let enter = Markdown.__get__('enter')
  let merged = Object.assign({}, asset, {
    markdown: {
      title: Array(3).fill(asset.markdown.title).join(' & '),
      text: Array(3).fill(asset.markdown.text).join(`${enter} —————————————— ${enter}`)
    },
    at: {
      atMobiles: ['test1', 'test2', 'test3'],
      isAtAll: true
    }
  })

  t.deepEqual(merged, Markdown.__get__('mergeMarkdown')([
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test1'],
        isAtAll: true
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test2'],
        isAtAll: false
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test3'],
        isAtAll: false
      }
    })
  ]))
})

test('it should filter the same atMobiles', (t) => {
  let enter = Markdown.__get__('enter')
  let merged = Object.assign({}, asset, {
    markdown: {
      title: Array(3).fill(asset.markdown.title).join(' & '),
      text: Array(3).fill(asset.markdown.text).join(`${enter} —————————————— ${enter}`)
    },
    at: {
      atMobiles: ['test1', 'test2'],
      isAtAll: false
    }
  })

  t.deepEqual(merged, Markdown.__get__('mergeMarkdown')([
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test1'],
        isAtAll: false
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test2'],
        isAtAll: false
      }
    }),
    Object.assign({}, asset, {
      at: {
        atMobiles: ['test2'],
        isAtAll: false
      }
    })
  ]))
})
