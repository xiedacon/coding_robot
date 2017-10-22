'use strict'

const agent = require('superagent').agent()

const { dingding } = require('../config')
const enter = '　　　　　　　　　　　　　　　　　　　　　'

exports.markdown = (title, link, text = '', ats = [], atAll = false) => {
  ats = ats.map((at) => {
    let user = dingding.users.find(user => user.realname === at)

    if (user) return user.name
    else return at
  })

  text = `#### [${title}](${link}) ${ats.reduce((res, at) => `${res}@${at} `, '')} \r\n ${enter} \r\n ${
    dingding.users.reduce((text, user) => {
      if (text.indexOf(`@${user.realname}`) < 0) return text

      ats.push(user.name)
      return text.replace(`@${user.realname}`, `@${user.name}`)
    }, text.replace(/\[@(.*)\]\(.*\)/g, '@$1'))
    }`

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

exports.mergeMarkdown = (msg1, msg2) => {
  let title = `${msg1.markdown.title} & ${msg2.markdown.title}`
  let text = `${msg1.markdown.text} \r\n ${enter} \r\n —————————————— \r\n ${enter} \r\n ${msg2.markdown.text}`
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
