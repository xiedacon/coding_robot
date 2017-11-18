'use strict'

const coding = require('./coding')
const dingding = require('./dingding')
const { core } = require('../config')

const limit = core.interval / 60 * core.limit

let excute
let wait = Date.now()

exports.sendMsgs = async function sendMsgs (before) {
  console.log('wait:', (Date.now() - wait) / 1000, 'ms')
  excute = Date.now()

  console.log(new Date(before))
  let msgs = await coding.getMsgs(before)

  if (msgs && msgs.length > 0) {
    msgs = mergeMsgs(msgs, limit)

    await dingding.send(msgs)
  }

  console.log('excute:', (Date.now() - excute) / 1000, 'ms', '\n')
  wait = Date.now()
}

function mergeMsgs (msgs, limit) {
  if (msgs.length <= limit) return msgs

  let ret = new Array(limit)

  let step = Math.ceil(msgs.length / limit)
  let length = msgs.length % limit

  for (let i = 0; i < limit; i++) {
    let _step = i < length ? step : (step - 1)
    ret[i] = dingding.mergeMarkdown(msgs.slice(0, _step))
    msgs = msgs.slice(_step)
  }

  return ret
}
