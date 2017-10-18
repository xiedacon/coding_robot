'use strict'

const agent = require('superagent').agent()

const { dingding } = require('../config')
const enter = ' \n 　　　　　　　　　　　　　　　　　　　　　 \n '

exports.markdown = (lines = []) => {
  let ats = []

  let text = dingding.users.reduce((text, user) => {
    if (text.indexOf(`@${user.realname}`) < 0) return text

    ats.push(user.name)
    return text.replace(`@${user.realname}`, `@${user.name}`)
  }, lines.join(enter).replace(/\[@([^\]]*)\]\([^)]*\)/g, '@$1'))

  return {
    'msgtype': 'markdown',
    'markdown': {
      title: Date.now(),
      text
    },
    'at': {
      'atMobiles': Array.from(new Set(ats)),
      'isAtAll': false
    }
  }
}

exports.mergeMarkdown = (msg1, msg2) => {
  let title = `${msg1.markdown.title} & ${msg2.markdown.title}`
  let text =
    `${msg1.markdown.text}` +
    enter +
    ' —————————————— ' +
    enter +
    `${msg2.markdown.text}`
  let ats = Array.from(new Set(msg1.at.atMobiles.concat(msg2.at.atMobiles)))
  let atAll = msg1.at.isAtAll || msg2.at.isAtAll

  return {
    'msgtype': 'markdown',
    'markdown': {
      title,
      text
    },
    'at': {
      'atMobiles': ats,
      'isAtAll': atAll
    }
  }
}

exports.send = async (msgs) => {
  if (!Array.isArray(msgs)) msgs = [msgs]
  console.log(msgs)
  await Promise.all(msgs.map((msg) => {
    return agent
      .post(dingding.hook)
      .set('Content-Type', 'application/json')
      .send(msg)
  }))
}
