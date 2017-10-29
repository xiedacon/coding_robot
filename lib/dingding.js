'use strict'

const agent = require('superagent').agent()

const { dingding } = require('../config')
const enter = '\n \n 　 \n \n'

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

exports.mergeMarkdown = (msgs) => {
  let title = msgs.map(msg => msg.markdown.title).join(' & ')
  let text = msgs.map(msg => msg.markdown.text).join(`${enter} —————————————— ${enter}`)
  let ats = Array.from(new Set(msgs.reduce((ats, msg) => ats.concat(msg.at.atMobiles), [])))
  let atAll = msgs.reduce((atAll, msg) => atAll || msg.at.isAtAll, false)

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
