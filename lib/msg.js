'use strict'

const Promise = require('bluebird')

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
  let activities = await coding.getActivities(before)

  let msgs = (await Promise.mapSeries(activities, (activity) => {
    let method = coding[activity.target_type]

    if (method) return method(activity)
    else return coding.newType(activity)
  })).filter(m => m)

  if (msgs && msgs.length > 0) {
    if (msgs.length > limit) {
      msgs = mergeMsgs(msgs)
    }

    await dingding.send(msgs)
  }

  console.log('excute:', (Date.now() - excute) / 1000, 'ms', '\n')
  wait = Date.now()
}

function mergeMsgs (msgs) {
  let ret = new Array(limit)

  while (msgs.length !== 0) {
    for (let i = 0; i < limit; i++) {
      if (msgs.length === 0) break

      let msg = ret[i]
      ret[i] = msg ? dingding.mergeMarkdown(msg, msgs.shift()) : msgs.shift()
    }
  }

  return ret
}
